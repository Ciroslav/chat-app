import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceModule } from './services/auth/auth.module';
import { UserServiceModule } from './services/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { MessagesModule } from './services/messages/messages.module';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    UserServiceModule,
    AuthServiceModule,
    MessagesModule,
  ],
})
export class AppModule {}
