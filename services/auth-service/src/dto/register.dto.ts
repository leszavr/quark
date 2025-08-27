import { IsEmail, IsString, MinLength } from 'class-validator';
import { PasswordValidator } from '../validators/password.validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
