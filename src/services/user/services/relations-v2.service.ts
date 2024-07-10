import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';
import { RelationType } from '@prisma/client';

@ServiceName('Relations Service V2')
@Injectable()
export class RelationsServiceV2 {
  constructor(private readonly logger: ServiceLogger, private readonly prisma: PrismaService) {
    this.logger = new ServiceLogger('Relations Service');
  }
  async createRelation(selfUuid: string, targetUuid: string, type: string) {
    const relationToCreate = type === 'block' ? RelationType.BLOCKED : RelationType.PENDING;
    if (targetUuid === selfUuid) {
      throw new ConflictException("Feeling lonely? Can't send friend request to yourself.");
    }
    try {
      // Check for existing relation in both configurations
      const existingRelation = await this.prisma.userRelations.findFirst({
        where: {
          OR: [
            { sender: selfUuid, receiver: targetUuid },
            { sender: targetUuid, receiver: selfUuid },
          ],
        },
      });
      if (relationToCreate === RelationType.BLOCKED) {
        // If updating to BLOCKED, ensure the current user is set as the sender
        if (existingRelation?.sender !== selfUuid) {
          await this.prisma.userRelations.update({
            where: {
              id: existingRelation.id,
            },
            data: {
              sender: selfUuid,
              receiver: targetUuid,
              type: relationToCreate,
            },
          });
        }
        await this.prisma.userRelations.upsert({
          where: {
            sender_receiver: { sender: selfUuid, receiver: targetUuid },
          },
          create: {
            sender: selfUuid,
            receiver: targetUuid,
            type: relationToCreate,
          },
          update: {
            type: relationToCreate,
          },
        });
      }
      if (relationToCreate !== RelationType.PENDING) {
        if (existingRelation?.type === RelationType.PENDING) {
          throw new ConflictException('Friend request already pending.');
        }
        if (existingRelation?.type === RelationType.BLOCKED) {
          throw new ConflictException('Can not send friend request to this user.');
        }
        if (existingRelation?.type === RelationType.FRIEND) {
          throw new ConflictException('Already friends with the user.');
        }
        await this.prisma.userRelations.create({
          data: {
            sender: selfUuid,
            receiver: targetUuid,
          },
        });
      }
    } catch (error) {
      console.error('Error creating/updating relation:', error);
      throw new ConflictException('Error creating/updating the relation.');
    }
  }

  async acceptFriendRequest(selfUuid: string, targetUuid: string) {
    try {
      await this.prisma.userRelations.update({
        where: {
          sender_receiver: { sender: targetUuid, receiver: selfUuid },
          type: RelationType.PENDING,
        },
        data: {
          type: RelationType.FRIEND,
        },
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw new ConflictException('Error accepting a friend request.');
    }
  }

  async deleteRelation(selfUuid: string, targetUuid: string) {
    try {
      await this.prisma.userRelations.deleteMany({
        where: {
          OR: [
            { sender: selfUuid, receiver: targetUuid },
            {
              sender: targetUuid,
              receiver: selfUuid,
              type: {
                not: RelationType.BLOCKED,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error deleting relation:', error);
      throw new ConflictException('Error deleting the relation.');
    }
  }

  //TODO: parse response remove sensitive data and group
  async getUserRelations(selfUuid: string) {
    try {
      const response = await this.prisma.userRelations.findMany({
        where: {
          OR: [{ sender: selfUuid }, { receiver: selfUuid }],
        },
        include: { senderUser: true, receiverUser: true },
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error fetchin relation:', error);
      throw new ConflictException('Error fetching the relation.');
    }
  }
}
