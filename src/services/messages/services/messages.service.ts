import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MESSAGE_DELETED } from 'src/contants';
import { GetMessagesDTO } from '../dto/get-messages.dto';

@ServiceName('Messages service')
@Injectable()
export class MessagesService {
  constructor(private readonly logger: ServiceLogger, private readonly prisma: PrismaService) {
    this.logger = new ServiceLogger(MessagesService);
  }

  //TODO Add mapper
  async createMessage(createMessageDto: CreateMessageDto, conversationId: number, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    const { content, attachmentUrl } = createMessageDto;
    await this.prisma.message.create({
      data: {
        author: selfUuid,
        content: content,
        attachment_url: attachmentUrl,
        conversation_id: conversationId,
      },
    });
  }

  async updateMessage(updateMessageDto: UpdateMessageDto, conversationId: number, messageId: number, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    const { content } = updateMessageDto;
    await this.prisma.message.update({
      where: { id: messageId, conversation_id: conversationId },
      data: {
        author: selfUuid,
        content: content,
      },
    });
  }

  async getMessages(conversationId: number, queryParams: GetMessagesDTO, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    if (queryParams.before) {
      return this.getMessagesBefore(conversationId, queryParams.before, queryParams.limit);
    }
    if (queryParams.around) {
      return this.getMessagesAround(conversationId, queryParams.around, queryParams.limit);
    }
    return this.getLastMessages(conversationId, queryParams.limit);
  }

  async deleteMessage(conversationId: number, messageId: number, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        author: selfUuid,
        content: MESSAGE_DELETED,
        attachment_url: null,
        deleted: true,
        conversation_id: conversationId,
      },
    });
  }
  async pinMessage(conversationId: number, messageId: number, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    await this.prisma.message.update({
      where: { id: messageId, conversation_id: conversationId },
      data: {
        pinned: true,
      },
    });
  }

  async findAllPins(conversationId: number, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    await this.prisma.message.findMany({
      where: { pinned: true, conversation_id: conversationId },
    });
  }

  async unpinMessage(conversationId: number, messageId: number, selfUuid: string) {
    const chatParticipant = await this.isChatParticipant(conversationId, selfUuid);
    if (!chatParticipant) {
      throw new ForbiddenException('Not participant of this chat');
    }
    await this.prisma.message.update({
      where: { id: messageId, conversation_id: conversationId },
      data: {
        pinned: false,
      },
    });
  }

  private async getMessagesBefore(conversationId: number, messageId: number, limit: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
        id: {
          lt: messageId,
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: limit,
    });
    if (messages.length === 0) {
      throw new Error('Message not found');
    }
    return messages;
  }

  private async getMessagesAround(conversationId: number, messageId: number, limit: number) {
    const halfLimit = Math.floor(limit / 2);

    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const beforeMessages = await this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
        id: {
          lt: messageId,
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: halfLimit,
    });

    const afterMessages = await this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
        id: {
          gt: messageId,
        },
      },
      orderBy: {
        id: 'asc',
      },
      take: halfLimit,
    });

    return [...beforeMessages.reverse(), message, ...afterMessages];
  }
  private async getLastMessages(conversationId: number, limit: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
      },
      orderBy: {
        id: 'desc',
      },
      take: limit,
    });
    return messages.reverse();
  }

  private async isChatParticipant(conversationId: number, selfUuid) {
    const response = await this.prisma.conversationParticipants.count({
      where: { conversation_id: conversationId, user: selfUuid },
    });
    return !(response === 0);
  }
}
