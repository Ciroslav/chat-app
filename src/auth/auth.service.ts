import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';
import { hash, compare } from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(signupDto: SignupDto) {
    const hash = await this.hashData(signupDto.password);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          username: signupDto.username,
          passwordHash: hash,
          uuid: uuid(),
        },
      });

      const tokens = await this.getTokens(
        newUser.uuid,
        newUser.email,
        newUser.username,
      );
      await this.updateRtHash(newUser.uuid, tokens.refresh_token);
      return tokens;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with given '${error.meta.target[0]}' already exists.`,
        );
      }
      throw error;
    }
  }
  async login(loginDto: LoginDto): Promise<Tokens> {
    let user = null;
    if (loginDto.email) {
      user = await this.prisma.user.findUnique({
        where: {
          email: loginDto.email,
        },
      });
      console.log('email', user);
    } else {
      user = await this.prisma.user.findUnique({
        where: {
          username: loginDto.username,
        },
      });
      console.log('username', user);
    }
    if (!user) throw new ForbiddenException('Incorrect credentials.');
    const passwordMatches = await compare(loginDto.password, user.passwordHash);
    if (!passwordMatches)
      throw new ForbiddenException('Incorrect credentials.');
    const tokens = await this.getTokens(user.uuid, user.email, user.username);
    await this.updateRtHash(user.uuid, tokens.refresh_token);
    return tokens;
  }

  async logout(uuid: string) {
    console.log(uuid);
    await this.prisma.user.updateMany({
      where: {
        uuid: uuid,
        rtHash: {
          not: null,
        },
      },
      data: {
        rtHash: null,
      },
    });
  }
  async refreshToken(uuid: string, refreshToken: string) {
    console.log(uuid);
    console.log(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: {
        uuid: uuid,
      },
    });
    console.log('service user', user);
    if (!user) throw new ForbiddenException();
    if (!user.rtHash) throw new ForbiddenException(); // user logged out
    const refreshTokenValid = await compare(refreshToken, user.rtHash);
    console.log('refreshToken valid', refreshTokenValid);
    if (!refreshTokenValid) throw new ForbiddenException();
    const tokens = await this.getTokens(user.uuid, user.email, user.username);
    console.log('service', tokens);
    await this.updateRtHash(user.uuid, tokens.refresh_token);
    return tokens;
  }

  hashData(data: string) {
    return hash(data, 10);
  }
  //TODO: refresh token is not issued again if it is still valid
  async getTokens(
    userId: string,
    email: string,
    username: string,
  ): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          email,
        },
        { secret: 'at-secret', expiresIn: 60 * 15 },
      ),
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          email,
        },
        { secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 14 },
      ),
    ]);
    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async updateRtHash(uuid: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prisma.user.update({
      where: {
        uuid: uuid,
      },
      data: {
        rtHash: hash,
      },
    });
  }
}
