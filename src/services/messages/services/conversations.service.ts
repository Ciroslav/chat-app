import { Injectable, NotFoundException } from '@nestjs/common';

import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';

@ServiceName('Conversations service')
@Injectable()
export class ConversationsService {
  constructor(private readonly logger: ServiceLogger, private readonly prisma: PrismaService) {
    this.logger = new ServiceLogger(ConversationsService);
  }

  //TODO Add mapper
  async createConversation(createConversationDto: CreateConversationDto, selfUuid: string) {
    const { participants, publicChat } = createConversationDto;
    participants.push(selfUuid);
    const conversation = await this.prisma.conversation.create({
      data: { creator: selfUuid, public: publicChat },
    });

    const prismaPayload = [];
    participants.map((el) => prismaPayload.push({ user: el, conversation_id: conversation.id }));
    await this.prisma.conversationParticipants.createMany({
      data: prismaPayload,
    });
    return { success: true, conversationId: conversation.id };
  }

  async findAll(selfUUid: string) {
    return await this.prisma.conversationParticipants.findMany({
      where: { user: selfUUid },
      select: { conversation_id: true },
    });
  }

  async findOne(conversationId: number) {
    return await this.prisma.conversation.findMany({
      where: { id: conversationId },
      select: {
        id: true,
        created_at: true,
        conversations_users: {
          select: { user: true, joined_at: true, left_at: true },
        },
      },
    });
  }

  //TODO IMPLEMENT LOGIC FOR SKIPPING DUPLICATES
  async addParticipants(conversationId: number, updateConversationDto: UpdateConversationDto) {
    const { participants, limitedAccess, accessSince } = updateConversationDto;

    const prismaPayload = [];
    participants.map((el) =>
      prismaPayload.push({
        user: el,
        conversation_id: conversationId,
        limited_access: limitedAccess,
        access_since: accessSince,
      }),
    );
    const response = await this.prisma.conversationParticipants.createMany({
      data: prismaPayload,
    });
    console.log(response);
    return { success: true };
  }

  async leaveConversation(conversatioId: number, selfUUid: string) {
    const response = await this.prisma.conversationParticipants.updateMany({
      where: { user: selfUUid, conversation_id: conversatioId, left_at: null },
      //TODO FIX THIS
      data: { left_at: 'SADA' },
    });
    if (response.count === 0) {
      throw new NotFoundException('Conversation not found.');
    }
    return { success: true };
  }
}
