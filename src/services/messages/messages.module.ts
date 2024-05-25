import { Module } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { ConversationsController } from './conversations.controller';
import { ServiceLogger } from 'src/common/logger';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, ServiceLogger],
})
export class MessagesModule {}
