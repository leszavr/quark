import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { VaultService } from "../vault/vault.service";
import { JwtSecretRotatedEvent } from "../vault/events/jwt-secret-rotated.event";
import * as jwt from "jsonwebtoken";

@Injectable()
export class DynamicJwtService {
  private readonly logger = new Logger(DynamicJwtService.name);

  constructor(
    private readonly vaultService: VaultService
  ) {}

  /**
   * Подписывает JWT токен с актуальным секретом из Vault
   */
  async sign(payload: object): Promise<string> {
    try {
      const secret = await this.vaultService.getJWTSecret();
      
      return jwt.sign(payload, secret, {
        algorithm: "HS256",
      } as jwt.SignOptions);
    } catch (error) {
      this.logger.error("❌ Error signing JWT:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Верифицирует JWT токен с актуальным секретом из Vault
   * Поддерживает graceful переход при ротации секретов
   */
  async verify(token: string): Promise<any> {
    try {
      const currentSecret = await this.vaultService.getJWTSecret();
      
      // Сначала пытаемся с текущим секретом
      try {
        return jwt.verify(token, currentSecret, {
          algorithms: ["HS256"],
          issuer: "quark-auth-service",
        });
      } catch (currentSecretError) {
        this.logger.warn("⚠️ Token verification failed with current secret, trying previous secret...");
        
        // Если не прошло, пытаемся с предыдущим секретом (для graceful transition)
        const previousSecret = await this.vaultService.getPreviousJWTSecret();
        if (previousSecret) {
          try {
            const payload = jwt.verify(token, previousSecret, {
              algorithms: ["HS256"],
              issuer: "quark-auth-service",
            });
            
            this.logger.warn("✅ Token verified with previous secret - consider refreshing token");
            return payload;
          } catch (previousSecretError) {
            this.logger.error("❌ Token verification failed with both current and previous secrets");
            throw currentSecretError; // Возвращаем оригинальную ошибку
          }
        } else {
          throw currentSecretError;
        }
      }
    } catch (error) {
      this.logger.error("❌ Error verifying JWT:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Декодирует JWT токен без верификации (для получения payload)
   */
  decode(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Обработчик события ротации JWT секрета
   */
  @OnEvent("jwt.secret.rotated")
  handleJwtSecretRotated(event: JwtSecretRotatedEvent) {
    this.logger.log("🔄 JWT secret rotation detected");
    this.logger.log(`⏰ Rotated at: ${event.rotatedAt.toISOString()}`);
    this.logger.log("✅ DynamicJwtService ready for new secret");
    
    // Дополнительная логика может быть добавлена здесь
    // Например, инвалидация кэша или уведомление других компонентов
  }
}
