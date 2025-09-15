import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as vault from 'node-vault';
import { createHash, randomBytes } from 'crypto';
import { JwtSecretRotatedEvent } from './events/jwt-secret-rotated.event';

@Injectable()
export class VaultService implements OnModuleInit {
  private readonly logger = new Logger(VaultService.name);
  private vault: any;
  private jwtSecret: string;
  private lastSecretUpdate: Date;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.vault = vault({
      apiVersion: 'v1',
      endpoint: this.configService.get('VAULT_URL', 'http://vault:8200'),
      token: this.configService.get('VAULT_TOKEN', 'myroot'),
    });
  }

  async onModuleInit() {
    await this.initializeVaultConnection();
    await this.ensureJWTSecret();
    
    // Запускаем периодическое обновление секрета каждые 30 минут
    setInterval(async () => {
      await this.rotateJWTSecret();
    }, 30 * 60 * 1000); // 30 минут
  }

  private async initializeVaultConnection(): Promise<void> {
    try {
      // Проверяем статус Vault
      const status = await this.vault.status();
      this.logger.log(`🔐 Vault connection established: ${JSON.stringify(status)}`);
      
      // Проверяем, что мы можем читать/писать секреты
      await this.vault.read('sys/health');
      this.logger.log('✅ Vault health check passed');
      
    } catch (error) {
      this.logger.error('❌ Failed to connect to Vault:', error.message);
      
      // Fallback на переменную окружения если Vault недоступен
      this.logger.warn('⚠️ Using fallback JWT_SECRET from environment');
      this.jwtSecret = this.configService.get('JWT_SECRET', 'fallback-secret-key');
      this.lastSecretUpdate = new Date();
    }
  }

  private async ensureJWTSecret(): Promise<void> {
    try {
      // Пытаемся получить существующий секрет
      const result = await this.vault.read('secret/data/jwt');
      
      if (result?.data?.data?.secret) {
        this.jwtSecret = result.data.data.secret;
        this.lastSecretUpdate = new Date(result.data.data.created_at || Date.now());
        this.logger.log('🔑 JWT secret loaded from Vault');
      } else {
        // Создаем новый секрет если не существует
        await this.generateAndStoreJWTSecret();
      }
    } catch (error) {
      if (error.response?.statusCode === 404) {
        // Секрет не найден, создаем новый
        await this.generateAndStoreJWTSecret();
      } else {
        this.logger.error('❌ Error reading JWT secret from Vault:', error.message);
        throw error;
      }
    }
  }

  private async generateAndStoreJWTSecret(): Promise<void> {
    try {
      // Генерируем криптографически стойкий секрет
      const secret = randomBytes(64).toString('hex');
      const createdAt = new Date().toISOString();
      
      // Сохраняем в Vault
      await this.vault.write('secret/data/jwt', {
        data: {
          secret,
          created_at: createdAt,
          algorithm: 'HS256',
          rotation_interval: '30m'
        }
      });

      this.jwtSecret = secret;
      this.lastSecretUpdate = new Date(createdAt);
      
      this.logger.log('🔑 New JWT secret generated and stored in Vault');
    } catch (error) {
      this.logger.error('❌ Failed to generate JWT secret:', error.message);
      throw error;
    }
  }

  async getJWTSecret(): Promise<string> {
    if (!this.jwtSecret) {
      await this.ensureJWTSecret();
    }
    return this.jwtSecret;
  }

  async rotateJWTSecret(): Promise<string> {
    try {
      this.logger.log('🔄 Starting JWT secret rotation...');
      
      // Генерируем новый секрет
      const newSecret = randomBytes(64).toString('hex');
      const rotatedAt = new Date().toISOString();
      
      // Сохраняем старый секрет для graceful transition
      const oldSecret = this.jwtSecret;
      
      // Записываем новый секрет в Vault
      await this.vault.write('secret/data/jwt', {
        data: {
          secret: newSecret,
          created_at: rotatedAt,
          previous_secret: oldSecret,
          algorithm: 'HS256',
          rotation_interval: '30m'
        }
      });

      // Обновляем локальный секрет
      this.jwtSecret = newSecret;
      this.lastSecretUpdate = new Date(rotatedAt);
      
      this.logger.log('✅ JWT secret rotated successfully');
      this.logger.log(`🔄 Secret rotation completed at: ${rotatedAt}`);
      this.logger.log(`🔑 New secret length: ${newSecret.length} chars`);
      
      // Генерируем событие ротации секрета
      const rotationEvent = new JwtSecretRotatedEvent(
        oldSecret,
        newSecret,
        new Date(rotatedAt)
      );
      
      this.eventEmitter.emit('jwt.secret.rotated', rotationEvent);
      this.logger.log('📢 JWT rotation event emitted');
      
      return newSecret;
    } catch (error) {
      this.logger.error('❌ JWT secret rotation failed:', error.message);
      throw error;
    }
  }

  async validateSecretAge(): Promise<boolean> {
    const maxAge = 35 * 60 * 1000; // 35 минут (с запасом)
    const age = Date.now() - this.lastSecretUpdate.getTime();
    
    if (age > maxAge) {
      this.logger.warn('⚠️ JWT secret is older than expected, forcing rotation');
      await this.rotateJWTSecret();
      return false;
    }
    
    return true;
  }

  getSecretInfo(): {
    lastUpdate: Date;
    ageMinutes: number;
    nextRotation: Date;
  } {
    const ageMs = Date.now() - this.lastSecretUpdate.getTime();
    const ageMinutes = Math.floor(ageMs / (60 * 1000));
    const nextRotation = new Date(this.lastSecretUpdate.getTime() + (30 * 60 * 1000));
    
    return {
      lastUpdate: this.lastSecretUpdate,
      ageMinutes,
      nextRotation
    };
  }

  // Health check для мониторинга
  async healthCheck(): Promise<{
    vault_connected: boolean;
    jwt_secret_age_minutes: number;
    next_rotation: string;
    status: 'healthy' | 'warning' | 'error';
  }> {
    try {
      await this.vault.read('sys/health');
      const secretInfo = this.getSecretInfo();
      
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (secretInfo.ageMinutes > 35) {
        status = 'error';
      } else if (secretInfo.ageMinutes > 32) {
        status = 'warning';
      }
      
      return {
        vault_connected: true,
        jwt_secret_age_minutes: secretInfo.ageMinutes,
        next_rotation: secretInfo.nextRotation.toISOString(),
        status
      };
    } catch (error) {
      return {
        vault_connected: false,
        jwt_secret_age_minutes: -1,
        next_rotation: 'unknown',
        status: 'error'
      };
    }
  }

  /**
   * Получает предыдущий JWT секрет для graceful transition при ротации
   */
  async getPreviousJWTSecret(): Promise<string | null> {
    try {
      const result = await this.vault.read('secret/data/jwt');
      return result?.data?.data?.previous_secret || null;
    } catch (error) {
      this.logger.error('❌ Error reading previous JWT secret from Vault:', error.message);
      return null;
    }
  }
}
