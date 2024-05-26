import { Controller, Post, Param, UseGuards, Delete, Get, Query } from '@nestjs/common';
import { RelationsService } from './services/relations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { AccessGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';
import { GetManyUsersUnrestrictedDTO } from './dto/getUsers.dto';

@ApiTags(SwaggerTags.Relations)
@ApiBearerAuth()
@Controller('user')
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @UseGuards(AccessGuard)
  @Post('/send-request/:uuid')
  @ApiOperation({ summary: 'Send friend request' })
  sendRequest(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.sendFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/cancel-request/:uuid')
  @ApiOperation({ summary: 'Cancel friend request' })
  cancelRequest(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.cancelFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/accept-request/:uuid')
  @ApiOperation({ summary: 'Accept friend request' })
  acceptRequest(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.acceptFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/refuse-request/:uuid')
  @ApiOperation({ summary: 'Refuse friend request' })
  refuseRequest(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.refuseFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/block-user/:uuid')
  @ApiOperation({ summary: 'Block user' })
  blockUser(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.blockUser(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Delete('/remove-friend/:uuid')
  @ApiOperation({ summary: 'Delete friend' })
  deleteFriend(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.removeFriend(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Delete('/unblock-user/:uuid')
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(@Param('uuid') targetUuid: string, @GetCurrentUserData('uuid') selfUuid: string): Promise<any> {
    return this.relationsService.unblockUser(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Get('/friends/')
  @ApiOperation({
    summary: 'Search for friends by username / get all if empty string as name',
  })
  findFriends(@Query() queryParams: GetManyUsersUnrestrictedDTO, @GetCurrentUserData('uuid') uuid: string) {
    return this.relationsService.findFriends(queryParams, uuid);
  }

  @UseGuards(AccessGuard)
  @Get('/blocked/')
  @ApiOperation({
    summary: 'Search for blocked users by username / get all if empty string as name',
  })
  findBlocked(@Query() queryParams: GetManyUsersUnrestrictedDTO, @GetCurrentUserData('uuid') uuid: string) {
    return this.relationsService.findBlockedUsers(queryParams, uuid);
  }

  @UseGuards(AccessGuard)
  @Get('/pending-sent/')
  @ApiOperation({
    summary: 'Search for pending sent friend requests ',
  })
  findPendingSent(@GetCurrentUserData('uuid') uuid: string) {
    return this.relationsService.findPendingSent(uuid);
  }

  @UseGuards(AccessGuard)
  @Get('/pending-received/')
  @ApiOperation({
    summary: 'Search for pending received friend requests',
  })
  findPendingReceived(@GetCurrentUserData('uuid') uuid: string) {
    return this.relationsService.findPendingReceived(uuid);
  }

  @UseGuards(AccessGuard)
  @Get('/users/')
  @ApiOperation({
    summary: 'Search for users eligible for friend request',
  })
  findUsersFiltered(@Query() queryParams: GetManyUsersUnrestrictedDTO, @GetCurrentUserData('uuid') uuid: string) {
    return this.relationsService.findAllUsersFiltered(queryParams, uuid);
  }
}
