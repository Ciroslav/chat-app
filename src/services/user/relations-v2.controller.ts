import { Controller, Post, Param, UseGuards, Delete, Get, Put, Query } from '@nestjs/common';
import { RelationsServiceV2 } from './services/relations-v2.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { AccessGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';

@ApiTags(SwaggerTags.RelationsV2)
@ApiBearerAuth()
@Controller('/relation')
export class RelationsControllerV2 {
  constructor(private readonly relationsServiceV2: RelationsServiceV2) {}

  @UseGuards(AccessGuard)
  @Post('/:uuid')
  @ApiOperation({ summary: 'Send friend request / Block user with type=block added' })
  createRelation(
    @Param('uuid') targetUuid: string,
    @Query('type') type: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ) {
    return this.relationsServiceV2.createRelation(selfUuid, targetUuid, type);
  }

  @UseGuards(AccessGuard)
  @Put('/:uuid')
  @ApiOperation({ summary: 'Accept friend request' })
  acceptFriendRequest(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string) {
    return this.relationsServiceV2.acceptFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Delete('/:uuid')
  @ApiOperation({ summary: 'Delete friend / remove from blacklist / cancel or delete friend request' })
  deleteRelation(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string) {
    return this.relationsServiceV2.deleteRelation(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Get('/@me')
  @ApiOperation({ summary: 'Get all self relations' })
  getSelfRelations(@GetCurrentUserData('uuid') selfUuid: string) {
    return this.relationsServiceV2.getUserRelations(selfUuid);
  }
}
