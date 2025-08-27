import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'password', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    // Минимум 8 символов
    if (password.length < 8) return false;

    // Должен содержать хотя бы одну цифру
    if (!/\d/.test(password)) return false;

    // Должен содержать хотя бы одну букву в верхнем регистре
    if (!/[A-Z]/.test(password)) return false;

    // Должен содержать хотя бы одну букву в нижнем регистре
    if (!/[a-z]/.test(password)) return false;

    // Должен содержать хотя бы один специальный символ
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character';
  }
}
