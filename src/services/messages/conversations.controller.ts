import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SwaggerTags } from 'src/swagger';
import { GetCurrentUserData } from 'src/common/decorators';
import { AccessGuard } from 'src/common/guards';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './services/messages.service';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiTags(SwaggerTags.Conversations)
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(AccessGuard)
  @Post('/')
  @ApiOperation({ summary: 'Create conversation' })
  @ApiBody({ type: CreateConversationDto })
  create(
    @Body() CreateConversationDto: CreateConversationDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.conversationsService.create(CreateConversationDto, selfUuid);
  }

  @UseGuards(AccessGuard)
  @ApiOperation({ summary: 'Find all user conversations' })
  @Get()
  findAll(@GetCurrentUserData('uuid') selfUuid: string) {
    return this.conversationsService.findAll(selfUuid);
  }

  @UseGuards(AccessGuard)
  @Get('/:id')
  findOne(
    @Param('id') id: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.conversationsService.findOne(+id, selfUuid);
  }
  @UseGuards(AccessGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.conversationsService.update(
      +id,
      updateConversationDto,
      selfUuid,
    );
  }
  @UseGuards(AccessGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.conversationsService.remove(+id, selfUuid);
  }
}

@ApiTags(SwaggerTags.Messages)
@ApiBearerAuth()
@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AccessGuard)
  @Post('/')
  @ApiOperation({ summary: 'Create message' })
  @ApiBody({ type: CreateMessageDto })
  create(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.create(
      createMessageDto,
      +conversationId,
      selfUuid,
    );
  }

  //TODO add search params
  // @UseGuards(AccessGuard)
  // @ApiOperation({ summary: 'Find all user conversations' })
  // @Get()
  // findAll(@GetCurrentUserData('uuid') selfUuid: string) {
  //   return this.messagesService.findAll(selfUuid);
  // }

  // @UseGuards(AccessGuard)
  // @Get('/conversations/:conversationId/messages/:messageId')
  // findOne(
  //   @Param('messageId') messageId: string,
  //   @Param('conversationId') conversationId: string,
  //   @GetCurrentUserData('uuid') selfUuid: string,
  // ) {
  //   return this.messagesService.findOne(+conversationId, +messageId, selfUuid);
  // }
  @UseGuards(AccessGuard)
  @Patch('/:messageId')
  @ApiOperation({ summary: 'Edit message' })
  update(
    @Param('messageId') messageId: string,
    @Param('conversationId') conversationId: string,
    @Body() updateConversationDto: UpdateMessageDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.update(
      updateConversationDto,
      +conversationId,
      +messageId,
      selfUuid,
    );
  }
  @UseGuards(AccessGuard)
  @Delete('/:messageId')
  @ApiOperation({ summary: 'Delete message' })
  remove(
    @Param('messageId') messageId: string,
    @Param('conversationId') conversationId: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.remove(+conversationId, +messageId, selfUuid);
  }
}
