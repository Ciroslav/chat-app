import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationParticipantGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization.split(' ')[1];

    const decodedToken = this.jwtService.decode(accessToken) as {
      uuid: string;
    };
    const userId = decodedToken.uuid;

    const conversationId = Number(this.getConversationId(request));
    const isAllowed = await this.isChatParticipant(conversationId, userId);
    return isAllowed;
  }

  private getConversationId(request: any): string | undefined {
    const conversationId = request.params.conversationId;
    return conversationId;
  }
  private async isChatParticipant(conversationId: number, userId: string) {
    const response = await this.prisma.conversationParticipants.count({
      where: { conversation_id: conversationId, user: userId },
    });
    return !(response === 0);
  }
}
