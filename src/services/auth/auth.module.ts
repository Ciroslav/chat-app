import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { ServiceLogger } from 'src/common/logger';
import { AUTH_REPOSITORY } from './constants';
import { PrismaAuthRepository } from './prisma-auth.respository';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    ServiceLogger,
    { provide: PrismaClient, useFactory: () => new PrismaClient() },
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
  ],
})
export class AuthServiceModule {}
