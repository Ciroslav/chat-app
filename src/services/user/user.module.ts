import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UsersController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServiceLogger } from 'src/common/logger';
import { RelationsController } from './relations.controller';
import { RelationsService } from './services/relations.service';
import { RelationsServiceV2 } from './services/relations-v2.service';
import { RelationsControllerV2 } from './relations-v2.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UsersController, RelationsController, RelationsControllerV2],
  providers: [UserService, RelationsService, RelationsServiceV2, ServiceLogger],
})
export class UserServiceModule {}
