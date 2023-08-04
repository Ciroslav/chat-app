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
import { LoginDtoValidatorPipe } from '../../common/pipes/login.pipe';
import { AccessGuard, RefreshGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';

@ApiTags(SwaggerTags.Authorization)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up' })
  @ApiBody({ type: SignupDto })
  signup(@Body() signupDto: SignupDto): Promise<Tokens> {
    return this.authService.signup(signupDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new LoginDtoValidatorPipe()) loginDto: LoginDto,
  ): Promise<Tokens> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AccessGuard)
  @ApiOperation({ summary: 'Invalidates refresh token' })
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserData('uuid') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(RefreshGuard)
  @Get('/refresh')
  @UseGuards(AccessGuard)
  @ApiOperation({ summary: 'Issues new Refresh/Access token pair' })
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUserData('uuid') uuid: string,
    @GetCurrentUserData('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(uuid, refreshToken);
  }
}
