import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceModule } from './services/auth/auth.module';
import { UserServiceModule } from './services/user/user.module';
import { MessagesModule } from './services/messages/messages.module';
import { GatewayModule } from './services/gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './services/storage/storage.module';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    UserServiceModule,
    AuthServiceModule,
    MessagesModule,
    GatewayModule,
    StorageModule,
  ],
})
export class AppModule {}
