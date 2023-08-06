import { Module } from '@nestjs/common';
import { AuthServiceModule } from './services/auth/auth.module';
import { UserServiceModule } from './services/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, UserServiceModule, AuthServiceModule],
})
export class AppModule {}
