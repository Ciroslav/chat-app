import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
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
import { GetMessagesDTO } from './dto/get-messages.dto';
import { ConversationParticipantGuard } from 'src/common/guards/conversation-participant.guard';

@ApiTags(SwaggerTags.Conversations)
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(AccessGuard)
  @Post('/')
  @ApiOperation({ summary: 'Create conversation' })
  @ApiBody({ type: CreateConversationDto })
  create(@Body() CreateConversationDto: CreateConversationDto, @GetCurrentUserData('uuid') selfUuid: string) {
    return this.conversationsService.createConversation(CreateConversationDto, selfUuid);
  }

  @UseGuards(AccessGuard)
  @ApiOperation({ summary: 'Find all user conversations' })
  @Get('/')
  findAll(@GetCurrentUserData('uuid') selfUuid: string) {
    return this.conversationsService.findAll(selfUuid);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Get('/:conversationId')
  findOne(@Param('conversationId') conversationId: string, @GetCurrentUserData('uuid') selfUuid: string) {
    return this.conversationsService.findOne(+conversationId, selfUuid);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Patch('/:conversationId')
  updateConversation(
    @Param('conversationId') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.conversationsService.addParticipants(+id, updateConversationDto, selfUuid);
  }
  @UseGuards(AccessGuard)
  @Delete('/:conversationId')
  leaveConversation(@Param('conversationId') conversationId: string, @GetCurrentUserData('uuid') selfUuid: string) {
    return this.conversationsService.leaveConversation(+conversationId, selfUuid);
  }
}

@ApiTags(SwaggerTags.Messages)
@ApiBearerAuth()
@Controller('conversations/:conversationId')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Post('/messages')
  @ApiBody({ type: CreateMessageDto })
  @ApiOperation({ summary: 'Create message' })
  create(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.createMessage(createMessageDto, +conversationId, selfUuid);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Get('/messages')
  @ApiOperation({ summary: 'Display messages, use before for lazy loading, use around to jump to message' })
  findOne(
    @Query() queryParams: GetMessagesDTO,
    @Param('conversationId') conversationId: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.getMessages(+conversationId, queryParams);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Patch('/messages/:messageId')
  @ApiBody({ type: UpdateMessageDto })
  @ApiOperation({ summary: 'Edit message' })
  update(
    @Param('messageId') messageId: string,
    @Param('conversationId') conversationId: string,
    @Body() updateConversationDto: UpdateMessageDto,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.updateMessage(updateConversationDto, +conversationId, +messageId, selfUuid);
  }
  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Delete('/:messageId')
  @ApiOperation({ summary: 'Delete message' })
  remove(
    @Param('messageId') messageId: string,
    @Param('conversationId') conversationId: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.messagesService.deleteMessage(+conversationId, +messageId, selfUuid);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @ApiOperation({ summary: 'Find all pins' })
  @Get('/pins')
  findAll(@Param('conversationId') conversationId: string) {
    return this.messagesService.findAllPins(+conversationId);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Patch('/pins/:messageId')
  @ApiOperation({ summary: 'Pin message' })
  pinMessage(@Param('messageId') messageId: string, @Param('conversationId') conversationId: string) {
    return this.messagesService.pinMessage(+conversationId, +messageId);
  }

  @UseGuards(ConversationParticipantGuard)
  @UseGuards(AccessGuard)
  @Delete('pins/:messageId/')
  @ApiOperation({ summary: 'Unpin message' })
  unpinMessage(@Param('messageId') messageId: string, @Param('conversationId') conversationId: string) {
    return this.messagesService.unpinMessage(+conversationId, +messageId);
  }
}
