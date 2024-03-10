/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
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
    return;
  }

  async cancelFriendRequest(selfUuid: string, targeUuid: string) {
    return;
  }

  async acceptFriendRequest(selfUuid: string, targetUuid: string) {
    return;
  }

  async refuseFriendRequest(selfUuid: string, targetUuid: string) {
    return;
  }

  async blockUser(selfUuid: string, targetUuid: string) {
    return;
  }

  async unblockUser(selfUuid: string, targetUuid: string) {
    return;
  }
}
