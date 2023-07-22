import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto';
import { Tokens } from './types';
import { LoginDtoValidatorPipe } from './pipes/login.pipe';
import { AuthGuard } from '@nestjs/passport';

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

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(uuid: string) {
    return this.authService.logout(uuid);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken() {
    return this.authService.refreshToken();
  }
}
