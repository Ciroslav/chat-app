import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DB_CONNECTION_STRING'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect;
  }
  async onModuleDestroy() {
    await this.$disconnect;
  }
}
