import { Controller, Post, Param, UseGuards, Delete } from '@nestjs/common';
import { RelationsService } from './services/relations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { AccessGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';

@ApiTags(SwaggerTags.Relations)
@Controller('users')
@ApiBearerAuth()
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @UseGuards(AccessGuard)
  @Post('/send-request/:uuid')
  @ApiOperation({ summary: 'Send friend request' })
  sendRequest(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.sendFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/cancel-request/:uuid')
  @ApiOperation({ summary: 'Cancel friend request' })
  cancelRequest(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.cancelFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/accept-request/:uuid')
  @ApiOperation({ summary: 'Accept friend request' })
  acceptRequest(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.acceptFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/refuse-request/:uuid')
  @ApiOperation({ summary: 'Refuse friend request' })
  refuseRequest(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.refuseFriendRequest(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/block-user/:uuid')
  @ApiOperation({ summary: 'Block user' })
  blockUser(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.blockUser(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Delete('/remove-friend/:uuid')
  @ApiOperation({ summary: 'Delete friend' })
  deleteFriend(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.removeFriend(selfUuid, targetUuid);
  }

  @UseGuards(AccessGuard)
  @Post('/unblock-user/:uuid')
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(
    @Param('uuid') targetUuid: string,
    @GetCurrentUserData('uuid') selfUuid: string,
  ): Promise<any> {
    return this.relationsService.unblockUser(selfUuid, targetUuid);
  }
}
