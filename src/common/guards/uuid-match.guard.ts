import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UuidMatchGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization.split(' ')[1];

    const decodedToken = this.jwtService.decode(accessToken) as {
      uuid: string;
      role: string;
    };
    const accessTokenUuid = decodedToken.uuid;
    const accessTokenRole = decodedToken.role;

    if (accessTokenRole === 'ADMIN') {
      return true; // Allow ADMIN regardless of UUID match
    }

    const requestUuid = this.getRequestUuid(request);

    return accessTokenUuid === requestUuid;
  }

  private getRequestUuid(request: any): string | undefined {
    const requestUuid = request.params.uuid;
    return requestUuid;
  }
}
