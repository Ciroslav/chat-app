import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto';
import { compare } from 'bcrypt';
import { createHash } from 'crypto';
import { v4 as uuid4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens, JwtSecrets } from './types';
import { ServiceLogger } from 'src/common/logger';
import { ServiceName } from 'src/common/decorators';
import { ConfigService } from '@nestjs/config';

// 15 minutes Access Token lifespan
const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 15;
// 2 weeks Refresh Token lifespan
const REFRESH_TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 14;

@ServiceName('Auth Service')
@Injectable()
export class AuthService {
  private jwtSecrets: JwtSecrets;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: ServiceLogger,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecrets = {
      accessTokenSecret: this.configService.get('JWT_SECRETS').AT_SECRET,
      refreshTokenSecret: this.configService.get('JWT_SECRETS').RT_SECRET,
    };
    this.logger = new ServiceLogger('Auth Service');
  }

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
    if (!user) throw new ForbiddenException('Incorrect credentials.');
    const passwordMatches = await compare(
      loginDto.password,
      user.password_hash,
    );
    if (!passwordMatches) {
      this.logger.log(
        `Failed login attempt for user with uuid: '${user.uuid}.'`,
      );
      throw new ForbiddenException('Incorrect credentials.');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account expired or disabled.');
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
    this.logger.log(`User with uuid '${user.uuid}' successfully logged in.`);
    return tokens;
  }

  async logoutOne(
    userId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    const rtHash = await this.hashToken(refreshToken);

    const data = await this.prisma.session.updateMany({
      where: {
        user_id: userId,
        rt_hash: rtHash,
      },
      data: {
        rt_hash: null,
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
        user_id: userId,
        rt_hash: { not: null },
      },
      data: {
        rt_hash: null,
      },
    });
    this.logger.log(`User with uuid '${userId}' invalidated all sessions.`);
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
        user_id: userId,
        rt_hash: rtHash,
        uuid: uuid4(),
        issued_at: issuedAt,
        expires_at: expiresAt,
        login_ip_address: loginIp,
        last_accessed_at: new Date(),
        role: role,
      },
    });
  }

  async updateSessionLastAccessed(sessionId: number): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        last_accessed_at: new Date(),
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
        user_id: userId,
        rt_hash: rtHash,
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
        last_accessed_at: new Date(),
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
        {
          secret: this.jwtSecrets.accessTokenSecret,
          expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
        },
      ),
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          email,
          role,
        },
        {
          secret: this.jwtSecrets.refreshTokenSecret,
          expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
        },
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

  private async hashToken(data: string): Promise<string> {
    const hash = createHash('sha256');
    hash.update(data);
    const hashedData = hash.digest('hex');
    return hashedData;
  }
}
