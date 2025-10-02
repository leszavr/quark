import { IsString, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';

export enum DeviceType {
  WEB = 'web',
  MOBILE_IOS = 'mobile_ios',
  MOBILE_ANDROID = 'mobile_android',
  DESKTOP = 'desktop',
  API = 'api',
}

// DTO для управления профилем
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsObject()
  profileSettings?: {
    isPublic?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    allowMessages?: boolean;
    timezone?: string;
    language?: string;
  };
}

// DTO для регистрации устройства
export class RegisterDeviceDto {
  @IsString()
  name: string;

  @IsEnum(DeviceType)
  type: DeviceType;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  deviceFingerprint: string;
}

// DTO для включения 2FA
export class Enable2FADto {
  @IsString()
  totpToken: string; // Код из приложения аутентификатора
}

// DTO для верификации 2FA
export class Verify2FADto {
  @IsString()
  token: string;

  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean;
}

// DTO для смены пароля
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}

// Response DTO для 2FA setup
export class Setup2FAResponseDto {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

// Response DTO для устройств
export class DeviceResponseDto {
  id: string;
  name: string;
  type: DeviceType;
  status: string;
  location?: string;
  lastSeenAt?: Date;
  isTrusted: boolean;
  isCurrentDevice: boolean;
  createdAt: Date;
}

// Response DTO для сессий
export class SessionResponseDto {
  id: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivityAt?: Date;
  isCurrentSession: boolean;
  createdAt: Date;
}
