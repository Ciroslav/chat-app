import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'gateway',
})
export class GatewayController implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly gatewayService: GatewayService) {}
  async handleConnection(client: Socket, server: Server) {
    this.gatewayService.handleConnection(client);
    console.log(client.data.user);
  }
  @SubscribeMessage('message')
  notify(@MessageBody() name: string) {
    this.server.emit('message', `${name} joined.`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
