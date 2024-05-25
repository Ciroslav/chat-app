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
