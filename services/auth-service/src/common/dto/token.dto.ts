import { IsString, IsArray, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum TokenType {
  USER = 'user',
  SERVICE = 'service', 
  HUB = 'hub'
}

export class BaseTokenPayload {
  @IsString()
  sub: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsNumber()
  exp: number;

  @IsString()
  iss: string;

  @IsArray()
  @IsString({ each: true })
  aud: string[];

  @IsEnum(TokenType)
  token_type: TokenType;
}

/**
 * User Tokens (Клиентские токены)
 * Для аутентификации пользователей в клиентских приложениях
 */
export class UserTokenPayload extends BaseTokenPayload {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  token_type: TokenType.USER;
}

/**
 * Service Tokens (Межсервисные токены)
 * Для аутентификации сервисов друг с другом
 */
export class ServiceTokenPayload extends BaseTokenPayload {
  @IsString()
  service_id: string;

  @IsString()
  service_name: string;

  token_type: TokenType.SERVICE;
}

/**
 * Hub Tokens (Системные токены)
 * Для системных операций Plugin Hub
 */
export class HubTokenPayload extends BaseTokenPayload {
  @IsString()
  service_id: string;

  token_type: TokenType.HUB;
}

/**
 * DTO для создания токенов
 */
export class CreateTokenDto {
  @IsEnum(TokenType)
  token_type: TokenType;

  @IsString()
  sub: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsArray()
  @IsString({ each: true })
  aud: string[];

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  service_id?: string;

  @IsOptional()
  @IsString()
  service_name?: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsNumber()
  exp?: number; // Если не указано, используется дефолтное время жизни
}

/**
 * DTO для ответа с токеном
 */
export class TokenResponseDto {
  @IsString()
  access_token: string;

  @IsEnum(TokenType)
  token_type: TokenType;

  @IsNumber()
  expires_in: number;

  @IsString()
  issued_at: string;
}
