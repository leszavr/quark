import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { User } from "./user.entity";
import { Setup2FAResponseDto } from "../common/dto/profile.dto";

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateTwoFactorSecret(userId: string): Promise<Setup2FAResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Генерируем секрет для TOTP
    const secret = speakeasy.generateSecret({
      name: `Quark Platform (${user.email})`,
      issuer: "Quark Platform",
      length: 20,
    });

    // Генерируем QR код
    let qrCodeUrl = "";
    if (secret.otpauth_url) {
      qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    }

    // Генерируем резервные коды
    const backupCodes = this.generateBackupCodes();

    // Сохраняем секрет (временно, до подтверждения)
    await this.userRepository.update(userId, {
      twoFactorSecret: secret.base32,
      backupCodes,
    });

    return {
      qrCodeUrl,
      secret: secret.base32,
      backupCodes,
    };
  }

  async enableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.twoFactorSecret) {
      throw new BadRequestException("2FA setup not initiated");
    }

    // Проверяем токен
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2, // Допускаем небольшое расхождение времени
    });

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA token");
    }

    // Включаем 2FA
    await this.userRepository.update(userId, {
      twoFactorEnabled: true,
    });
  }

  async disableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Проверяем токен или резервный код
    const isValidToken = user.twoFactorSecret && speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2,
    });

    const isValidBackupCode = user.backupCodes?.includes(token);

    if (!isValidToken && !isValidBackupCode) {
      throw new UnauthorizedException("Invalid 2FA token or backup code");
    }

    // Если использован резервный код, удаляем его
    if (isValidBackupCode) {
      const updatedBackupCodes = (user.backupCodes ?? []).filter(code => code !== token);
      await this.userRepository.update(userId, {
        backupCodes: updatedBackupCodes,
      });
    }

    // Отключаем 2FA
    await this.userRepository.update(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      backupCodes: undefined,
    });
  }

  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Проверяем TOTP токен
    const isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (isValidToken) {
      return true;
    }

    // Проверяем резервный код
    const isValidBackupCode = user.backupCodes?.includes(token);
    if (isValidBackupCode) {
      // Удаляем использованный резервный код
      const updatedBackupCodes = (user.backupCodes ?? []).filter(code => code !== token);
      await this.userRepository.update(userId, {
        backupCodes: updatedBackupCodes,
      });
      return true;
    }

    return false;
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    
    await this.userRepository.update(userId, {
      backupCodes,
    });

    return backupCodes;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Генерируем 8-значные коды
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
