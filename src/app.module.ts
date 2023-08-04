import { Module } from '@nestjs/common';
import { AuthServiceModule } from './services/auth-service/auth.module';
import { UserServiceModule } from './services/user-service/user-service.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, UserServiceModule, AuthServiceModule],
})
export class AppModule {}
