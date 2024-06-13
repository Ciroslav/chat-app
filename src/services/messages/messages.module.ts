import { Module } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { ConversationsController, MessagesController } from './messages.controller';
import { ServiceLogger } from 'src/common/logger';
import { MessagesService } from './services/messages.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [ConversationsController, MessagesController],
  providers: [ConversationsService, MessagesService, ServiceLogger],
})
export class MessagesModule {}
