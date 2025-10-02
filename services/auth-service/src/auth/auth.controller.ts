import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, ForbiddenException, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '../common/dto/auth.dto';
import { Complete2FALoginDto } from '../common/dto/2fa.dto';
import { CreateTokenDto, TokenResponseDto } from '../common/dto/token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthResponseDto | { requiresTwoFactor: boolean; tempToken: string }> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.authService.login(loginDto, loginDto.deviceFingerprint, ipAddress);
  }

  @Post('login/2fa')
  @HttpCode(HttpStatus.OK)
  async complete2FALogin(@Body() complete2FADto: Complete2FALoginDto, @Request() req): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.authService.complete2FALogin(
      complete2FADto.tempToken,
      complete2FADto.twoFactorToken,
      complete2FADto.deviceFingerprint,
      complete2FADto.userAgent,
      ipAddress
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.authService.validateUser(user.userId);
    return {
      id: fullUser.id,
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      roles: fullUser.roles,
      isEmailVerified: fullUser.isEmailVerified,
      createdAt: fullUser.createdAt,
      lastLoginAt: fullUser.lastLoginAt,
    };
  }

  /**
   * Создание Service Token для межсервисного взаимодействия
   * Доступно только для Hub Tokens
   */
  @Post('tokens/service')
  @UseGuards(JwtAuthGuard)
  async createServiceToken(
    @Body() createTokenDto: CreateTokenDto,
    @CurrentUser() user: any
  ): Promise<TokenResponseDto> {
    // Проверяем, что запрос от Hub Token
    if (user.token_type !== 'hub') {
      throw new ForbiddenException('Only Hub tokens can create Service tokens');
    }
    return this.authService.createServiceToken(createTokenDto);
  }

  /**
   * Создание Hub Token для системных операций
   * Доступно только для системных операций
   */
  @Post('tokens/hub')
  @UseGuards(JwtAuthGuard)
  async createHubToken(
    @Body() createTokenDto: CreateTokenDto,
    @CurrentUser() user: any
  ): Promise<TokenResponseDto> {
    // Проверяем системные права
    if (!user.permissions?.includes('*')) {
      throw new ForbiddenException('Insufficient permissions for Hub token creation');
    }
    return this.authService.createHubToken(createTokenDto);
  }

  /**
   * Валидация токена
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() { token }: { token: string }) {
    const payload = await this.authService.validateToken(token);
    return {
      valid: true,
      payload,
      token_type: payload.token_type,
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}
