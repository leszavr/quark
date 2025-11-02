import { IsString } from "class-validator";

export class Complete2FALoginDto {
  @IsString()
  tempToken!: string;

  @IsString()
  twoFactorToken!: string;

  @IsString()
  deviceFingerprint?: string;

  @IsString()
  userAgent?: string;
}
