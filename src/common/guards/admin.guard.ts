// admin.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Get the JWT token from the request headers
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role === 'ADMIN') {
        return true;
      }
    } catch (err) {
      return false;
    }

    return false;
  }
}
