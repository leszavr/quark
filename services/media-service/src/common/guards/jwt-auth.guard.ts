import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      console.log('JWT Guard - Headers:', request.headers);
      
      if (!request.headers.authorization) {
        throw new UnauthorizedException('No token provided');
      }
      
      const [type, token] = request.headers.authorization.split(' ');
      if (type !== 'Bearer') {
        throw new UnauthorizedException('Invalid token type. Use Bearer token');
      }
      
      if (!token) {
        throw new UnauthorizedException('Invalid token format');
      }

      const result = (await super.canActivate(context)) as boolean;
      console.log('JWT Guard - Can Activate Result:', result);
      return result;
    } catch (error) {
      console.error('JWT Guard Error:', error.message);
      throw error;
    }
  }
}