import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { ServiceLogger } from 'src/common/logger';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [GatewayController, GatewayService, JwtService, ServiceLogger],
})
export class GatewayModule {}
