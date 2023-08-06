import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { Tokens } from './types';
import { LoginDtoValidatorPipe } from '../../common/pipes/login.pipe';
import { RefreshGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { Request } from 'express';

@ApiTags(SwaggerTags.Authorization)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  login(
    @Req() req: Request,
    @Body(new LoginDtoValidatorPipe()) loginDto: LoginDto,
  ): Promise<Tokens> {
    const loginIp = req.socket.remoteAddress;
    return this.authService.login(loginDto, loginIp);
  }

  @UseGuards(RefreshGuard)
  @ApiOperation({ summary: 'Invalidates given refresh token' })
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrentUserData('uuid') userId: string,
    @GetCurrentUserData('refreshToken') refreshToken: string,
  ) {
    console.log('CONTROLLER UUID', userId),
      console.log('Controller refresh token', refreshToken);
    return this.authService.logoutOne(userId, refreshToken);
  }

  @UseGuards(RefreshGuard)
  @ApiOperation({ summary: 'Invalidates all refresh tokens for user' })
  @Post('/logout-all')
  @HttpCode(HttpStatus.OK)
  logoutAll(
    @GetCurrentUserData('uuid') userId: string,
    @GetCurrentUserData('refreshToken') refreshToken: string,
  ) {
    console.log('CONTROLLER UUID', userId),
      console.log('Controller refresh token', refreshToken);
    return this.authService.logoutAll(userId, refreshToken);
  }

  @UseGuards(RefreshGuard)
  @Get('/refresh')
  @ApiOperation({ summary: 'Issues new Access token' })
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUserData('uuid') uuid: string,
    @GetCurrentUserData('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshAccessToken(uuid, refreshToken);
  }
}
