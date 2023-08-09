import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto';
import { hash, compare } from 'bcrypt';
import { createHash } from 'crypto';
import { v4 as uuid4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens } from './types';

// 15 minutes Access Token lifespan
const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 15;
// 2 weeks Refresh Token lifespan
const REFRESH_TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 14;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, loginIp: string): Promise<Tokens> {
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
    console.log('USER DATA', user);
    if (!user) throw new ForbiddenException('Incorrect credentials.');
    const passwordMatches = await compare(loginDto.password, user.passwordHash);
    if (!passwordMatches)
      throw new ForbiddenException('Incorrect credentials.');
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account expired or disabled');
    }
    const tokens = await this.issueTokens(
      user.uuid,
      user.email,
      user.username,
      user.role,
    );

    await this.createSession(
      user.uuid,
      tokens.refresh_token,
      loginIp,
      user.role,
    );
    return tokens;
  }

  async logoutOne(
    userId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    const rtHash = await this.hashToken(refreshToken);

    const data = await this.prisma.session.updateMany({
      where: {
        userId: userId,
        rtHash: rtHash,
      },
      data: {
        rtHash: null,
      },
    });
    if (data.count === 0) {
      return {
        message: 'Session already invalid.',
      };
    }
    return {
      message: 'Operation successful',
    };
  }
  async logoutAll(
    userId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    const rtHash = await this.hashToken(refreshToken);
    const session = await this.findSession(userId, rtHash);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException(); // Invalid session or session not associated with the user
    }

    const data = await this.prisma.session.updateMany({
      where: {
        userId: userId,
        rtHash: { not: null },
      },
      data: {
        rtHash: null,
      },
    });
    return { message: `Number of sessions invalidated: ${data.count}` };
  }
  async createSession(
    userId: string,
    refreshToken: string,
    loginIp: string,
    // use ENUM instead
    role: string,
  ): Promise<void> {
    const decodedToken = this.jwtService.decode(refreshToken) as JwtPayload;
    const issuedAt = this.convertTimestampToDate(decodedToken.iat);
    const expiresAt = this.convertTimestampToDate(decodedToken.exp);
    const rtHash = await this.hashToken(refreshToken);
    await this.prisma.session.create({
      data: {
        userId: userId,
        rtHash: rtHash,
        uuid: uuid4(),
        issuedAt: issuedAt,
        expiresAt: expiresAt,
        loginIpAdress: loginIp,
        lastAccessedAt: new Date(),
        role: role,
      },
    });
  }

  async updateSessionLastAccessed(sessionId: number): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }

  private async deleteSession(sessionId: number): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async findSession(userId: string, rtHash: string): Promise<any | null> {
    return await this.prisma.session.findFirst({
      where: {
        userId: userId,
        rtHash: rtHash,
      },
      include: {
        user: true,
      },
    });
  }

  //Generate new Access Token, while persisting Refresh Token
  async refreshAccessToken(
    userId: string,
    refreshToken: string,
  ): Promise<Tokens> {
    const rtHash = await this.hashToken(refreshToken);
    const session = await this.findSession(userId, rtHash);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException(); // Invalid session or session not associated with the user
    }

    // Update last accessed time for the session
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        lastAccessedAt: new Date(),
      },
    });

    const { access_token } = await this.issueTokens(
      userId,
      session.user.email,
      session.user.username,
      session.user.role,
    );

    return {
      access_token: access_token,
      refresh_token: refreshToken, // Keep the same refresh token
    };
  }

  //Generate new Pair of Refresh/Access Token
  async issueTokens(
    userId: string,
    email: string,
    username: string,
    role: string,
  ): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          email,
          role,
        },
        { secret: 'at-secret', expiresIn: ACCESS_TOKEN_EXPIRATION_TIME },
      ),
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          email,
          role,
        },
        { secret: 'rt-secret', expiresIn: REFRESH_TOKEN_EXPIRATION_TIME },
      ),
    ]);
    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
  /* HELPER FUNCTIONS 
<------------------------------------------------------------------------------------------------------------------------>
*/
  private convertTimestampToDate(timestamp: number) {
    return new Date(timestamp * 1000).toISOString();
  }

  private async hashPassword(data: string) {
    return hash(data, 10);
  }

  private async hashToken(data: string): Promise<string> {
    const hash = createHash('sha256');
    hash.update(data);
    const hashedData = hash.digest('hex');
    return hashedData;
  }
}
