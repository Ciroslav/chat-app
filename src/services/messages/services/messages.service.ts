import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MESSAGE_DELETED } from 'src/contants';

@ServiceName('Messages service')
@Injectable()
export class MessagesService {
  constructor(
    private readonly logger: ServiceLogger,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new ServiceLogger(MessagesService);
  }

  //TODO Add mapper
  async create(
    createMessageDto: CreateMessageDto,
    conversationId: number,
    selfUuid: string,
  ) {
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

  async update(
    updateMessageDto: UpdateMessageDto,
    conversationId: number,
    messageId: number,
    selfUuid: string,
  ) {
    const { content } = updateMessageDto;
    await this.prisma.message.update({
      where: { id: messageId, conversation_id: conversationId },
      data: {
        author: selfUuid,
        content: content,
      },
    });
  }

  async remove(conversationId: number, messageId: number, selfUuid: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        author: selfUuid,
        content: MESSAGE_DELETED,
        conversation_id: conversationId,
      },
    });
  }
}
