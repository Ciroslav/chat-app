import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { Tokens } from './types';
import { LoginDtoValidatorPipe } from '../../common/pipes/login.pipe';
import { RefreshGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { Request } from 'express';
import { AuthLoggingInterceptor } from 'src/common/interceptors/auth-logging.interceptor';

@ApiTags(SwaggerTags.Authorization)
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseInterceptors(AuthLoggingInterceptor)
  @UseGuards(RefreshGuard)
  @ApiOperation({
    summary: 'Invalidates given refresh token - Use refresh token',
  })
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

  @UseInterceptors(AuthLoggingInterceptor)
  @UseGuards(RefreshGuard)
  @ApiOperation({
    summary: 'Invalidates all refresh tokens for user - Use refresh token',
  })
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

  @UseInterceptors(AuthLoggingInterceptor)
  @UseGuards(RefreshGuard)
  @Get('/refresh')
  @ApiOperation({ summary: 'Issues new Access token- Use refresh token' })
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUserData('uuid') uuid: string,
    @GetCurrentUserData('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshAccessToken(uuid, refreshToken);
  }
}
