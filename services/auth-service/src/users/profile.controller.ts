import { 
  Controller, 
  Get, 
  Put, 
  Post, 
  Delete,
  Body, 
  UseGuards, 
  Request,
  Param,
  UnauthorizedException 
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { DeviceService } from "./device.service";
import { TwoFactorService } from "./two-factor.service";
import { 
  UpdateProfileDto, 
  RegisterDeviceDto, 
  Enable2FADto, 
  Verify2FADto,
  ChangePasswordDto,
  DeviceResponseDto,
  Setup2FAResponseDto
} from "../common/dto/profile.dto";

@Controller("profile")
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly deviceService: DeviceService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  /**
   * Получить информацию о профиле
   */
  @Get()
  async getProfile(@Request() req: { user: { userId: string } }) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      profileSettings: user.profileSettings,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Обновить профиль
   */
  @Put()
  async updateProfile(@Request() req: { user: { userId: string } }, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  /**
   * Сменить пароль
   */
  @Put("password")
  async changePassword(@Request() req: { user: { userId: string } }, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  /**
   * Устройства пользователя
   */
  @Get("devices")
  async getDevices(@Request() req: { user: { userId: string; deviceId?: string } }): Promise<DeviceResponseDto[]> {
    return this.deviceService.getUserDevices(req.user.userId, req.user.deviceId);
  }

  /**
   * Зарегистрировать новое устройство
   */
  @Post("devices")
  async registerDevice(@Request() req: { user: { userId: string } }, @Body() deviceDto: RegisterDeviceDto) {
  const ipAddress = (req as any).ip || (req as any).connection?.remoteAddress;
    return this.deviceService.registerDevice(req.user.userId, deviceDto, ipAddress);
  }

  /**
   * Доверять устройству (для пропуска 2FA)
   */
  @Put("devices/:deviceId/trust")
  async trustDevice(@Request() req: { user: { userId: string } }, @Param("deviceId") deviceId: string) {
    await this.deviceService.trustDevice(req.user.userId, deviceId);
    return { message: "Device trusted successfully" };
  }

  /**
   * Отозвать устройство
   */
  @Delete("devices/:deviceId")
  async revokeDevice(@Request() req: { user: { userId: string } }, @Param("deviceId") deviceId: string) {
    await this.deviceService.revokeDevice(req.user.userId, deviceId);
    return { message: "Device revoked successfully" };
  }

  /**
   * Инициировать настройку 2FA
   */
  @Post("2fa/setup")
  async setup2FA(@Request() req: { user: { userId: string } }): Promise<Setup2FAResponseDto> {
    return this.twoFactorService.generateTwoFactorSecret(req.user.userId);
  }

  /**
   * Включить 2FA
   */
  @Post("2fa/enable")
  async enable2FA(@Request() req: { user: { userId: string } }, @Body() enable2FADto: Enable2FADto) {
    await this.twoFactorService.enableTwoFactor(req.user.userId, enable2FADto.totpToken);
    return { message: "2FA enabled successfully" };
  }

  /**
   * Отключить 2FA
   */
  @Post("2fa/disable")
  async disable2FA(@Request() req: { user: { userId: string } }, @Body() verify2FADto: Verify2FADto) {
    await this.twoFactorService.disableTwoFactor(req.user.userId, verify2FADto.token);
    return { message: "2FA disabled successfully" };
  }

  /**
   * Восстановить резервные коды
   */
  @Post("2fa/backup-codes")
  async regenerateBackupCodes(@Request() req: { user: { userId: string } }) {
    const backupCodes = await this.twoFactorService.regenerateBackupCodes(req.user.userId);
    return { backupCodes };
  }
}
