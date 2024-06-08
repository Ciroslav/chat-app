import { Injectable } from '@nestjs/common';
import { ServiceLogger } from 'src/common/logger';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/types';

@Injectable()
export class GatewayService {
  constructor(
    private readonly logger: ServiceLogger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new ServiceLogger('GatewayService');
  }
  handleConnection(client: Socket) {
    this.authenticateClient(client);
  }
  handleDisconnect(client) {
    return;
  }

  private authenticateClient(client: Socket) {
    const secret = this.configService.get('JWT_SECRETS').AT_SECRET;
    const token = client.handshake.headers.authorization?.split(' ')[1];
    try {
      const userIdentity = this.jwtService.verify<JwtPayload>(token, { secret });
      client.data.user = { ...userIdentity, socketId: client.id };
      // console.log(client.data.user)
    } catch (error) {
      this.logger.error('Invalid token, connection not allowed', error);
      client.disconnect(true);
      return;
    }
  }
  private updateActivityStatus() {
    return;
  }
}
