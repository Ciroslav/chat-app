import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization.split(' ')[1];

    const decodedToken = this.jwtService.decode(accessToken) as {
      uuid: string;
      role: string;
    };
    const accessTokenRole = decodedToken.role;

    return accessTokenRole === 'ADMIN';
  }
}
