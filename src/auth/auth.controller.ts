import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('/signup')
  signup() {}

  @Post('/login')
  login() {}

  @Post('/logout')
  logout() {}

  @Post('/refresh')
  refreshToken() {}
}
