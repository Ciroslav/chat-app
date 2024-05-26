import { Module } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import {
  ConversationsController,
  MessagesController,
} from './conversations.controller';
import { ServiceLogger } from 'src/common/logger';
import { MessagesService } from './services/messages.service';

@Module({
  controllers: [ConversationsController, MessagesController],
  providers: [ConversationsService, MessagesService, ServiceLogger],
})
export class MessagesModule {}
