// Тип для аутентифицированного запроса
interface AuthenticatedRequest extends Request {
  user: Express.User;
}
/**
 * JWT Middleware для интеграции с Plugin Hub Enterprise JWT Middleware
 * Реализует правильную архитектуру МКС: Blog Service → Plugin Hub → auth-service/validate
 */

import { Request, Response, NextFunction } from "express";

interface UserContext {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export type { UserContext };

interface JWTValidationResponse {
  valid: boolean;
  user?: UserContext;
  error?: string;
  expires?: string;
}

// Расширяем Request для включения user context
declare global {
  namespace Express {
    // Тип User из @types/passport
    interface User {
      id?: string;
      username?: string;
      email?: string;
      roles?: string[];
      permissions?: string[];
      firstName?: string;
      lastName?: string;
      avatar?: string;
    }
    interface Request {
      user?: User;
  isAuthenticated: () => this is AuthenticatedRequest;
    }
  }
}

export class PluginHubJWTMiddleware {
  private pluginHubUrl: string;

  constructor(pluginHubUrl: string) {
    this.pluginHubUrl = pluginHubUrl;
  }

  /**
   * Middleware для чтения данных пользователя из заголовков Traefik ForwardAuth
   * Согласно архитектуре MKS: валидация JWT происходит в Traefik, не в модулях
   */
  validateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Читаем заголовки, установленные Traefik ForwardAuth middleware
      const userId = req.headers["x-user-id"] as string;
      const userRoles = req.headers["x-user-roles"] as string;
      const userPermissions = req.headers["x-user-permissions"] as string;
      const userSubject = req.headers["x-subject"] as string;

      if (!userId || !userSubject) {
        // Заголовки отсутствуют - пользователь не аутентифицирован
        req.isAuthenticated = function(): this is AuthenticatedRequest {
          return !!this.user;
        };
        return next();
      }

      // Парсим роли и разрешения из заголовков
      let roles: string[] = [];
      let permissions: string[] = [];

      try {
        if (userRoles) {
          // Сначала парсим как JSON массив
          const parsedRoles = JSON.parse(userRoles);
          
          // Если элементы массива - строки с JSON, парсим их дополнительно
          roles = parsedRoles.flatMap((role: string) => {
            if (typeof role === "string" && role.includes("\"")) {
              // Это экранированный JSON внутри строки
              try {
                return JSON.parse(role);
              } catch {
                return role.replace(/[{}"]/g, "").split(",").map((r: string) => r.trim());
              }
            }
            return role;
          }).filter((r: string) => r && r.trim());
        }
        if (userPermissions) {
          permissions = userPermissions.startsWith("[") ? JSON.parse(userPermissions) : userPermissions.split(",");
        }
      } catch (parseError) {
        console.warn("Failed to parse user roles/permissions from headers:", parseError);
        // Fallback - попробуем простой парсинг
        if (userRoles) {
          roles = userRoles.replace(/[[\]{}",]/g, "").split(/\s+/).filter((r: string) => r.trim());
        }
      }

      // Устанавливаем данные пользователя из доверенных заголовков
      req.user = {
        id: userId,
        username: req.headers["x-username"] as string || userId,
        email: req.headers["x-email"] as string || "",
        roles: roles,
        permissions: permissions,
        firstName: req.headers["x-first-name"] as string || "",
        lastName: req.headers["x-last-name"] as string || "",
        avatar: req.headers["x-avatar"] as string || ""
      };

      req.isAuthenticated = function(): this is AuthenticatedRequest {
        return !!this.user;
      };
      next();

    } catch (error) {
      console.error("Error reading ForwardAuth headers:", error instanceof Error ? error.message : String(error));
      req.isAuthenticated = function(): this is AuthenticatedRequest {
        return !!this.user;
      };
      next();
    }
  };  /**
   * Middleware для обязательной аутентификации
   */
  requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      res.status(401).json({
        error: "Authentication required",
        message: "This endpoint requires valid JWT token",
        loginUrl: "/auth/login"
      });
      return;
    }
    next();
  };

  /**
   * Middleware для проверки разрешений
   */
  requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        res.status(401).json({
          error: "Authentication required",
          message: "This endpoint requires authentication"
        });
        return;
      }

      // Администраторы имеют все разрешения
  const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
  const hasPermission = Array.isArray(req.user.permissions) && req.user.permissions.includes(permission);

      if (!isAdmin && !hasPermission) {
        res.status(403).json({
          error: "Insufficient permissions",
          message: `This endpoint requires '${permission}' permission`,
          userPermissions: req.user.permissions,
          userRoles: req.user.roles
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware для проверки ролей
   */
  requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        res.status(401).json({
          error: "Authentication required",
          message: "This endpoint requires authentication"
        });
        return;
      }

  if (!Array.isArray(req.user.roles) || !req.user.roles.includes(role)) {
        res.status(403).json({
          error: "Insufficient privileges",
          message: `This endpoint requires '${role}' role`,
          userRoles: req.user.roles
        });
        return;
      }

      next();
    };
  };

  /**
   * УДАЛЕНО: Извлечение токена больше не нужно
   * Traefik ForwardAuth передает проверенные данные через заголовки
   */

  /**
   * УДАЛЕНО: Валидация токена теперь происходит в Traefik ForwardAuth
   * Blog-service доверяет заголовкам от API Gateway согласно архитектуре MKS
   */

  /**
   * УДАЛЕНО: Кэширование больше не нужно
   * Traefik ForwardAuth обеспечивает производительность на уровне API Gateway
   */

  /**
   * Получение информации о текущем пользователе
   */
  getCurrentUser = (req: Request, res: Response): void => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      res.status(401).json({
        error: "Not authenticated",
        message: "No valid authentication found"
      });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar,
        roles: req.user.roles,
        permissions: req.user.permissions
      },
      authenticated: true
    });
  };
}

export default PluginHubJWTMiddleware;