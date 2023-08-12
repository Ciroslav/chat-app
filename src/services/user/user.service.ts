import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { v4 as uuid4 } from 'uuid';
import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';

@ServiceName('User Service')
@Injectable()
export class UserService {
  constructor(
    private readonly logger: ServiceLogger,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new ServiceLogger('User Service');
  }

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
      this.logger.log(`User created:\n${JSON.stringify(newUser, null, 2)}`);
      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with given ${error.meta.target[0]} already exists.`,
        );
      }
      throw new InternalServerErrorException();
    }
  }
  async update(
    uuid: string,
    updateUserDto: UpdateUserDTO,
    tokenUuid,
  ): Promise<Partial<User>> {
    try {
      const updatedUser = await this.prisma.user.update({
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
      this.logger.log(
        `User updated:\n${JSON.stringify(
          updatedUser,
          null,
          2,
        )} by '${tokenUuid}'`,
      );
      return updatedUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with given ${error.meta.target[0]} already exists.`,
        );
      }
      if (error.code === 'P2025') {
        console.log(error);
        throw new ForbiddenException();
      }
    }
  }

  async delete(uuid: string, tokenUuid: string): Promise<{ message: string }> {
    try {
      await this.prisma.user.delete({
        where: {
          uuid: uuid,
        },
      });
      this.logger.log(`User with uuid '${uuid}' deleted by '${tokenUuid}'.`);
      return { message: 'User successfully deleted.' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException();
      }
    }
  }
  findAll() {
    throw new NotImplementedException();
  }

  findOne(id: string) {
    console.log(id);
    throw new NotImplementedException();
  }

  /* HELPER FUNCTIONS 
<------------------------------------------------------------------------------------------------------------------------>
*/

  private async hashPassword(data: string) {
    return hash(data, 10);
  }
}
