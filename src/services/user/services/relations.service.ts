/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';

@ServiceName('Relations Service')
@Injectable()
export class RelationsService {
  constructor(
    private readonly logger: ServiceLogger,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new ServiceLogger('Relations Service');
  }

  async sendFriendRequest(selfUuid: string, targetUuid: string) {
    if (targetUuid === selfUuid) {
      throw new ConflictException(
        "Feeling lonely? Can't send friend request to yourself.",
      );
    }

    const user2 = await this.prisma.user.findUnique({
      where: { uuid: targetUuid },
    });

    console.log(user2);

    if (!user2) {
      throw new NotFoundException('User does not exist.');
    }

    const isBlocked = await this.prisma.blockList.findFirst({
      where: {
        user_uuid: targetUuid,
        blocked_uuid: selfUuid,
      },
    });

    if (isBlocked) {
      throw new ConflictException('Can not send friend request to this user.');
    }

    const relation = await this.prisma.friendList.findFirst({
      where: {
        OR: [
          {
            user1_uuid: selfUuid,
            user2_uuid: targetUuid,
          },
          {
            user1_uuid: targetUuid,
            user2_uuid: selfUuid,
          },
        ],
      },
    });

    if (relation && relation.status === 'PENDING') {
      throw new ConflictException('This friend request is already pending.');
    }
    if (relation && relation.status === 'ACCEPTED') {
      throw new ConflictException('Already friends with given user.');
    }

    await this.prisma.friendList.create({
      data: {
        user1_uuid: selfUuid,
        user2_uuid: targetUuid,
      },
    });

    return { message: 'Success.' };
  }

  async cancelFriendRequest(selfUuid: string, targetUuid: string) {
    const relation = await this.prisma.friendList.deleteMany({
      where: {
        user1_uuid: selfUuid,
        user2_uuid: targetUuid,
        status: 'PENDING', // Only cancel pending friend requests
      },
    });

    if (relation.count === 0) {
      throw new NotFoundException('Friend request not found.');
    }
    return { message: 'Success.' };
  }

  async acceptFriendRequest(selfUuid: string, targetUuid: string) {
    const relation = await this.prisma.friendList.updateMany({
      where: {
        user1_uuid: targetUuid,
        user2_uuid: selfUuid,
        status: 'PENDING', // Only accept pending friend requests
      },
      data: {
        status: 'ACCEPTED', // Set the status to ACCEPTED for accepted friend requests
      },
    });

    if (relation.count === 0) {
      throw new NotFoundException('Friend request not found.');
    }

    return { message: 'Success.' };
  }

  async refuseFriendRequest(selfUuid: string, targetUuid: string) {
    const relation = await this.prisma.friendList.deleteMany({
      where: {
        user1_uuid: targetUuid,
        user2_uuid: selfUuid,
        status: 'PENDING', // Only refuse pending friend requests
      },
    });

    if (relation.count === 0) {
      throw new NotFoundException('Friend request not found.');
    }

    return { message: 'Success' };
  }

  async removeFriend(selfUuid: string, targetUuid: string) {
    const relation = await this.prisma.friendList.deleteMany({
      where: {
        user1_uuid: selfUuid,
        user2_uuid: targetUuid,
        status: 'ACCEPTED', // Only remove accepted friend relationships
      },
    });

    if (relation.count === 0) {
      throw new NotFoundException(
        "User not in friends list, or doesn't exist.",
      );
    }

    return { message: 'Success.' };
  }

  async blockUser(selfUuid: string, targetUuid: string) {
    const relation = await this.prisma.blockList.findFirst({
      where: {
        user_uuid: selfUuid,
        blocked_uuid: targetUuid,
      },
    });

    if (relation) {
      throw new ConflictException('User already blocked.');
    }
    try {
      await this.prisma.blockList.create({
        data: {
          user_uuid: selfUuid,
          blocked_uuid: targetUuid,
        },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        // Foreign key constraint (uuid)
        throw new NotFoundException('User does not exist.');
      }
      this.logger.error(error);
      throw new InternalServerErrorException();
    }

    //Remove from friend list if blocked
    await this.prisma.friendList.deleteMany({
      where: {
        OR: [
          { user1_uuid: selfUuid, user2_uuid: targetUuid },
          { user1_uuid: targetUuid, user2_uuid: selfUuid },
        ],
      },
    });
    this.logger.log(`User ${selfUuid} blocked ${targetUuid}`);
    return { message: 'Success.' };
  }

  async unblockUser(selfUuid: string, targetUuid: string) {
    const relation = await this.prisma.blockList.deleteMany({
      where: {
        user_uuid: selfUuid,
        blocked_uuid: targetUuid,
      },
    });

    if (relation.count === 0) {
      throw new NotFoundException('User not found on blocked list.');
    }
    this.logger.log(`User ${selfUuid} blocked ${targetUuid}`);
    return { message: 'Success.' };
  }
}
