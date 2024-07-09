import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto';
import { compare } from 'bcrypt';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens, JwtSecrets } from './types';
import { ServiceLogger } from 'src/common/logger';
import { ServiceName } from 'src/common/decorators';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME } from 'src/contants';
import { AUTH_REPOSITORY } from './constants';
import { AuthRepository } from './auth.repository';

@ServiceName('Auth Service')
@Injectable()
export class AuthService {
  private jwtSecrets: JwtSecrets;
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
    private readonly logger: ServiceLogger,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecrets = {
      accessTokenSecret: this.configService.get('JWT_SECRETS').AT_SECRET,
      refreshTokenSecret: this.configService.get('JWT_SECRETS').RT_SECRET,
    };
    this.logger = new ServiceLogger('Auth Service');
  }

  async login(loginDto: LoginDto, loginIp: string): Promise<Tokens> {
    const { email, username, password } = loginDto;
    const user = email
      ? await this.authRepository.getUserByEmail(email)
      : await this.authRepository.getUserByUsername(username);

    if (!user) throw new ForbiddenException('Incorrect credentials.');
    const passwordMatches = await compare(password, user.passwordHash);
    if (!passwordMatches) {
      this.logger.log(`Failed login attempt for user with uuid: '${user.uuid}. Ip address: ${loginIp}`);
      throw new ForbiddenException('Incorrect credentials.');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account expired or disabled.');
    }
    const tokens = await this.issueTokens(user.uuid, user.username, user.preferredUsername, user.email, user.role);

    await this.createSession(user.uuid, tokens.refresh_token, loginIp, user.role);
    this.logger.log(`User with uuid '${user.uuid}' successfully logged in.`);
    return tokens;
  }

  async logoutOne(userId: string, refreshToken: string): Promise<{ message: string }> {
    const rtHash = await this.hashToken(refreshToken);
    const data = await this.authRepository.logout(userId, rtHash);
    return !data.count
      ? {
          message: 'Session already invalid.',
        }
      : {
          message: 'Operation successful',
        };
  }
  async logoutAll(userId: string, refreshToken: string): Promise<{ message: string }> {
    const rtHash = await this.hashToken(refreshToken);
    const session = await this.findSession(userId, rtHash);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException(); // Invalid session or session not associated with the user
    }

    const data = await this.authRepository.logoutAll(userId);
    this.logger.log(`User with uuid '${userId}' invalidated all sessions.`);
    return { message: `Number of sessions invalidated: ${data.count}` };
  }

  //Generate new Access Token, while persisting Refresh Token
  async refreshAccessToken(userId: string, refreshToken: string): Promise<Tokens> {
    const rtHash = await this.hashToken(refreshToken);
    const session = await this.findSession(userId, rtHash);
    console.log(session);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException(); // Invalid session or session not associated with the user
    }

    // Update last accessed time for the session
    await this.updateSessionLastAccessed(session.id);

    const { access_token } = await this.issueTokens(
      userId,
      session.user.username,
      session.user.preferredUsername,
      session.user.email,
      session.user.role,
    );

    return {
      access_token: access_token,
      refresh_token: refreshToken, // Keep the same refresh token
    };
  }

  //Generate new Pair of Refresh/Access Token
  private async issueTokens(
    userId: string,
    username: string,
    preferredUsername: string = username,
    email: string,
    role: string,
  ): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          preferredUsername: preferredUsername,
          email,
          role,
        },
        {
          secret: this.jwtSecrets.accessTokenSecret,
          expiresIn: ACCESS_TOKEN_LIFETIME,
        },
      ),
      this.jwtService.signAsync(
        {
          uuid: userId,
          username: username,
          preferredUsername: preferredUsername,
          email,
          role,
        },
        {
          secret: this.jwtSecrets.refreshTokenSecret,
          expiresIn: REFRESH_TOKEN_LIFETIME,
        },
      ),
    ]);
    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
  private async createSession(
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
    await this.authRepository.createSession(userId, rtHash, issuedAt, expiresAt, loginIp, role);
  }
  private async updateSessionLastAccessed(sessionId: number): Promise<void> {
    await this.authRepository.updateSessionLastAccessed(sessionId);
  }

  private async findSession(userId: string, rtHash: string) {
    const response = await this.authRepository.findSession(userId, rtHash);
    return response;
  }

  /* HELPER FUNCTIONS 
  <-------------------------------------------------------------------------------------------------------------------->
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
