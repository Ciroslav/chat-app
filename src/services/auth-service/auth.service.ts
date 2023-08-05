import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';
import { hash, compare } from 'bcrypt';
import { v4 as uuid4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  //TODO: write different logic that will not increase seq in case of failed requests
  async signup(signupDto: SignupDto) {
    const hash = await this.hashData(signupDto.password);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          username: signupDto.username,
          passwordHash: hash,
          uuid: uuid4(),
        },
      });
      return newUser;

      // const tokens = await this.getTokens(
      //   newUser.uuid,
      //   newUser.email,
      //   newUser.username,
      // );
      // await this.updateRtHash(newUser.uuid, tokens.refresh_token);
      // return tokens;
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
    } else {
      user = await this.prisma.user.findUnique({
        where: {
          username: loginDto.username,
        },
      });
    }
    if (!user) throw new ForbiddenException('Incorrect credentials.');
    const passwordMatches = await compare(loginDto.password, user.passwordHash);
    if (!passwordMatches)
      throw new ForbiddenException('Incorrect credentials.');
    const tokens = await this.getTokens(user.uuid, user.email, user.username);
    //change logic
    await this.saveSession(user.uuid, tokens.refresh_token);
    return tokens;
  }

  async logout(uuid: string) {
    console.log(uuid);
    await this.prisma.session.updateMany({
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
    const userWithSession = await this.prisma.user.findUnique({
      where: { uuid },
      include: { sessions: { select: { rtHash: true } } },
    });
    console.log('joined query', userWithSession);

    if (!userWithSession) {
      throw new ForbiddenException(); // User or session not found
    }

    const user = userWithSession[0];

    if (!user.rtHash) {
      throw new ForbiddenException(); // User logged out
    }

    const refreshTokenValid = await compare(refreshToken, user.rtHash);

    if (!refreshTokenValid) {
      throw new ForbiddenException(); // Invalid refresh token
    }

    const tokens = await this.getTokens(user.uuid, user.email, user.username);
    await this.saveSession(userWithSession[0].uuid, tokens.refresh_token);
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

  async saveSession(uuid: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prisma.session.create({
      data: {
        uuid: uuid4(),
        rtHash: hash,
        userId: uuid,
      },
    });
  }
  // async extendSession(uuid: string, refreshToken: string) {
  //   const hash = await this.hashData(refreshToken);
  //   await this.prisma.session.update({
  //     where: {
  //       userId: uuid,
  //       rtHash: hash,
  //     },
  //     data: {
  //       uuid: uuid4(),
  //       rtHash: hash,
  //       userId: uuid,
  //     },
  //   });
  // }
}
