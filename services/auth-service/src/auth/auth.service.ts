import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TwoFactorService } from '../users/two-factor.service';
import { DeviceService } from '../users/device.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '../common/dto/auth.dto';
import { CreateTokenDto, TokenResponseDto, TokenType, UserTokenPayload, ServiceTokenPayload, HubTokenPayload } from '../common/dto/token.dto';
import { User } from '../users/user.entity';
import { DynamicJwtService } from './dynamic-jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
    private deviceService: DeviceService,
    private jwtService: JwtService,
    private dynamicJwtService: DynamicJwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerDto);
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto, deviceFingerprint?: string, ipAddress?: string): Promise<AuthResponseDto | { requiresTwoFactor: boolean; tempToken: string }> {
    const { email, password } = loginDto;
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Проверяем, нужна ли 2FA
    if (user.twoFactorEnabled) {
      // Проверяем, является ли устройство доверенным
      const isTrustedDevice = deviceFingerprint ? 
        await this.deviceService.isDeviceTrusted(user.id, deviceFingerprint) : false;

      if (!isTrustedDevice) {
        // Создаем временный токен для 2FA
        const tempPayload = {
          sub: user.id,
          type: 'temp_2fa',
          exp: Math.floor(Date.now() / 1000) + (5 * 60), // 5 минут
        };
        const tempToken = await this.dynamicJwtService.sign(tempPayload, { expiresIn: '5m' });

        return {
          requiresTwoFactor: true,
          tempToken,
        };
      }
    }

    // Регистрируем устройство при входе
    if (deviceFingerprint) {
      await this.deviceService.registerDevice(user.id, {
        name: this.getDeviceNameFromUserAgent(loginDto.userAgent),
        type: this.getDeviceTypeFromUserAgent(loginDto.userAgent),
        deviceFingerprint,
        userAgent: loginDto.userAgent,
      }, ipAddress);
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return this.generateAuthResponse(user);
  }

  async complete2FALogin(tempToken: string, twoFactorToken: string, deviceFingerprint?: string, userAgent?: string, ipAddress?: string): Promise<AuthResponseDto> {
    // Проверяем временный токен
    let tempPayload;
    try {
      tempPayload = await this.dynamicJwtService.verify(tempToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    if (tempPayload.type !== 'temp_2fa') {
      throw new UnauthorizedException('Invalid token type');
    }

    const userId = tempPayload.sub;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Проверяем 2FA токен
    const is2FAValid = await this.twoFactorService.verifyTwoFactorToken(userId, twoFactorToken);
    if (!is2FAValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Регистрируем устройство при успешной аутентификации
    if (deviceFingerprint) {
      await this.deviceService.registerDevice(userId, {
        name: this.getDeviceNameFromUserAgent(userAgent),
        type: this.getDeviceTypeFromUserAgent(userAgent),
        deviceFingerprint,
        userAgent,
      }, ipAddress);
    }

    // Обновляем время последнего входа
    await this.usersService.updateLastLogin(userId);

    return this.generateAuthResponse(user);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: UserTokenPayload = { 
      sub: user.id,
      user_id: user.id,
      roles: user.roles,
      permissions: this.getUserPermissions(user.roles),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      iss: 'quark-auth-service',
      aud: ['blog-service', 'messaging-service', 'user-service'],
      token_type: TokenType.USER,
    };
    
    const access_token = await this.dynamicJwtService.sign(payload, { expiresIn: '24h' });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Создание Service Token для межсервисного взаимодействия
   */
  async createServiceToken(createTokenDto: CreateTokenDto): Promise<TokenResponseDto> {
    if (createTokenDto.token_type !== TokenType.SERVICE) {
      throw new UnauthorizedException('Invalid token type for service token creation');
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = createTokenDto.exp || now + (60 * 60 * 24); // 24 hours by default

    const payload: ServiceTokenPayload = {
      sub: createTokenDto.sub,
      service_id: createTokenDto.service_id!,
      service_name: createTokenDto.service_name!,
      roles: createTokenDto.roles,
      permissions: createTokenDto.permissions,
      exp,
      iss: 'quark-plugin-hub',
      aud: createTokenDto.aud,
      token_type: TokenType.SERVICE,
    };

    const access_token = await this.dynamicJwtService.sign(payload, { expiresIn: '24h' });

    return {
      access_token,
      token_type: TokenType.SERVICE,
      expires_in: exp - now,
      issued_at: new Date().toISOString(),
    };
  }

  /**
   * Создание Hub Token для системных операций
   */
  async createHubToken(createTokenDto: CreateTokenDto): Promise<TokenResponseDto> {
    if (createTokenDto.token_type !== TokenType.HUB) {
      throw new UnauthorizedException('Invalid token type for hub token creation');
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = createTokenDto.exp || now + (60 * 60 * 48); // 48 hours by default

    const payload: HubTokenPayload = {
      sub: createTokenDto.sub,
      service_id: createTokenDto.service_id!,
      roles: ['system', 'hub'],
      permissions: ['*'], // Hub has all permissions
      exp,
      iss: 'quark-plugin-hub',
      aud: ['*'], // Hub can access all services
      token_type: TokenType.HUB,
    };

    const access_token = await this.dynamicJwtService.sign(payload, { expiresIn: '48h' });

    return {
      access_token,
      token_type: TokenType.HUB,
      expires_in: exp - now,
      issued_at: new Date().toISOString(),
    };
  }

  /**
   * Валидация токена с определением типа
   */
  async validateToken(token: string): Promise<UserTokenPayload | ServiceTokenPayload | HubTokenPayload> {
    try {
      const payload = await this.dynamicJwtService.verify(token);
      
      // Проверяем тип токена и возвращаем соответствующий payload
      switch (payload.token_type) {
        case TokenType.USER:
          return payload as UserTokenPayload;
        case TokenType.SERVICE:
          return payload as ServiceTokenPayload;
        case TokenType.HUB:
          return payload as HubTokenPayload;
        default:
          throw new UnauthorizedException('Unknown token type');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Получение разрешений пользователя на основе ролей
   */
  private getUserPermissions(roles: string[]): string[] {
    const permissionMap: Record<string, string[]> = {
      'user': ['posts:read', 'profile:read', 'profile:update'],
      'moderator': ['posts:read', 'posts:moderate', 'users:moderate', 'profile:read', 'profile:update'],
      'admin': ['*'], // Админ имеет все разрешения
    };

    const permissions = new Set<string>();
    
    roles.forEach(role => {
      if (permissionMap[role]) {
        permissionMap[role].forEach(permission => permissions.add(permission));
      }
    });

    return Array.from(permissions);
  }

  /**
   * Определение типа устройства по User-Agent
   */
  private getDeviceTypeFromUserAgent(userAgent?: string): any {
    if (!userAgent) return 'web';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android')) return 'mobile_android';
    if (ua.includes('iphone') || ua.includes('ios')) return 'mobile_ios';
    if (ua.includes('electron')) return 'desktop';
    return 'web';
  }

  /**
   * Определение имени устройства по User-Agent
   */
  private getDeviceNameFromUserAgent(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';
    if (ua.includes('android')) return 'Android Device';
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('electron')) return 'Desktop App';
    
    return 'Unknown Device';
  }
}
