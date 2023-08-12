import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceModule } from './services/auth/auth.module';
import { UserServiceModule } from './services/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    UserServiceModule,
    AuthServiceModule,
  ],
})
export class AppModule {}
