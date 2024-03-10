import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UsersController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServiceLogger } from 'src/common/logger';
import { RelationsController } from './relations.controller';
import { RelationsService } from './services/relations.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UsersController, RelationsController],
  providers: [UserService, RelationsService, ServiceLogger],
})
export class UserServiceModule {}
