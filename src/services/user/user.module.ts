import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserServiceController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServiceLogger } from 'src/common/logger';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserServiceController],
  providers: [UserService, ServiceLogger],
})
export class UserServiceModule {}
