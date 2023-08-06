import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { createHash } from 'crypto';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async createUser(signupDto: CreateUserDTO): Promise<Partial<User>> {
    const hash = await this.hashPassword(signupDto.password);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          uuid: uuid4(),
          email: signupDto.email,
          username: signupDto.username,
          passwordHash: hash,
          country: signupDto.country,
          address: signupDto.address,
          phoneNumber: signupDto.phoneNumber,
        },
        select: {
          id: true,
          uuid: true,
          username: true,
          email: true,
          country: true,
          address: true,
          phoneNumber: true,
          createdAt: true,
          status: true,
          role: true,
        },
      });
      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with given ${error.meta.target[0]} already exists.`,
        );
      }
      throw InternalServerErrorException;
    }
  }
  async update(uuid: string, updateUserDto: UpdateUserDTO) {
    try {
      const newUser = await this.prisma.user.update({
        where: {
          uuid: uuid,
        },
        data: {
          email: updateUserDto.email,
          username: updateUserDto.username,
          country: updateUserDto.country,
          address: updateUserDto.address,
          phoneNumber: updateUserDto.phoneNumber,
        },
        select: {
          id: true,
          uuid: true,
          username: true,
          email: true,
          country: true,
          address: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          role: true,
        },
      });
      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with given ${error.meta.target[0]} already exists.`,
        );
      }
      throw InternalServerErrorException;
    }
  }

  async delete(uuid: string) {
    try {
      await this.prisma.user.delete({
        where: {
          uuid: uuid,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException();
      }
    }
    await this.prisma.user.delete({
      where: {
        uuid: uuid,
      },
    });
  }
  findAll() {
    return `This action returns all userService`;
  }

  findOne(id: string) {
    return `This action returns a #${id} userService`;
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
