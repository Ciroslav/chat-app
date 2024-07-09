import { Prisma, User } from '@prisma/client';
import { SessionWithUser } from './models/session-with-user';

export class AuthRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthRepositoryError';
  }
}

export interface AuthRepository {
  /**
   * Gets a specific user by email
   * @param email
   * @returns A Promise that resolves full User entity or an empty array.
   * @throws {AuthRepositoryError}
   */
  getUserByEmail(email: string): Promise<User>;

  /**
   * Gets a specific user by username
   * @param email
   * @returns A Promise that resolves full User entity or an empty array.
   * @throws {AuthRepositoryError}
   */
  getUserByUsername(username: string): Promise<User>;

  /**
   * Creates a user session
   * @param userId
   * @param rtHash
   * @param issuedAt
   * @param expires_at
   * @param loginIp
   * @param role
   * @returns A Promise that creates UserSession. Resolves with void.
   * @throws {AuthRepositoryError}
   */
  createSession(
    userId: string,
    rtHash: string,
    issuedAt: string,
    expiresAt: string,
    loginIp: string,
    role: string,
  ): Promise<void>;

  /**
   * Updates Session lastAccessedAt
   * @param sessionId
   * @returns A Promise that updates UserSession.lastAccessedAt. Resolves with void.
   * @throws {AuthRepositoryError}
   */
  updateSessionLastAccessed(sessionId: number): Promise<void>;

  /**
   * Finds Session by userid and rtHash
   * @param userId
   * @param rtHash
   * @returns A Promise that resolves with SessionWithUser null.
   * @throws {AuthRepositoryError}
   */
  findSession(userId: string, rtHash: string): Promise<SessionWithUser>;

  /**
   * Logs out user. Effectively deleting rtHash from the database.
   * @param userId
   * @param rtHash
   * @returns A Prisma BatchPayload promise
   * @throws {AuthRepositoryError}
   */
  logout(userId: string, rtHash: string): Promise<Prisma.BatchPayload>;

  /**
   * Logs out user. Effectively deleting rtHash from the database.
   * @param userId
   * @param rtHash
   * @returns A Prisma BatchPayload promise
   * @throws {AuthRepositoryError}
   */
  logoutAll(userId: string): Promise<Prisma.BatchPayload>;
}
