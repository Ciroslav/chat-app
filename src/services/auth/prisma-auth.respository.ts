import { Injectable } from '@nestjs/common';
import { AuthRepository, AuthRepositoryError } from './auth.repository';
import { PrismaClient, User } from '@prisma/client';
import { SessionWithUser } from './models/session-with-user';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async getUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }
  async getUserByUsername(username: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }
  async createSession(
    userId: string,
    rtHash: string,
    issuedAt: string,
    expiresAt: string,
    loginIp: string,
    role: string,
  ): Promise<void> {
    await this.prisma.userSession.create({
      data: {
        userId: userId,
        rtHash: rtHash,
        issuedAt: issuedAt,
        expiresAt: expiresAt,
        loginIpAddress: loginIp,
        lastAccessedAt: new Date(),
        role: role,
      },
    });
  }
  async updateSessionLastAccessed(sessionId: number): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }
  //TODO FIX RETURN VALUE
  async findSession(userId: string, rtHash: string): Promise<SessionWithUser> {
    return await this.prisma.userSession.findFirst({
      where: {
        userId: userId,
        rtHash: rtHash,
      },
      include: {
        user: true,
      },
    });
  }

  async logout(userId: string, rtHash: string) {
    return await this.prisma.userSession.updateMany({
      where: {
        userId: userId,
        rtHash: rtHash,
      },
      data: {
        rtHash: null,
      },
    });
  }
  async logoutAll(userId: string) {
    return await this.prisma.userSession.updateMany({
      where: {
        userId: userId,
        rtHash: {
          not: null,
        },
      },
      data: {
        rtHash: null,
      },
    });
  }
}
