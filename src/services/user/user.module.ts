import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserServiceController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserServiceController],
  providers: [UserService],
})
export class UserServiceModule {}
