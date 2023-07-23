import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto';
import { Tokens } from './types';
import { LoginDtoValidatorPipe } from '../common/pipes/login.pipe';
import { AccessGuard, RefreshGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() signupDto: SignupDto): Promise<Tokens> {
    return this.authService.signup(signupDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new LoginDtoValidatorPipe()) loginDto: LoginDto,
  ): Promise<Tokens> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AccessGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserData('uuid') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(RefreshGuard)
  @Get('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUserData('uuid') uuid: string,
    @GetCurrentUserData('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(uuid, refreshToken);
  }
}
