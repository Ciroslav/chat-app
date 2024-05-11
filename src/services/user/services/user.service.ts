import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO } from '../dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { v4 as uuid4 } from 'uuid';
import { ServiceName } from 'src/common/decorators';
import { ServiceLogger } from 'src/common/logger';
import { GetAllUsersDTO, GetManyUsersDTO } from '../dto/getUsers.dto';

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
          password_hash: hash,
          country: signupDto.country,
          address: signupDto.address,
          phone_number: signupDto.phoneNumber,
        },
        select: {
          uuid: true,
          username: true,
          email: true,
          country: true,
          address: true,
          phone_number: true,
          created_at: true,
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
      this.logger.error(error, 'user.service.ts line 61');
      throw new InternalServerErrorException();
    }
  }
  async updateUser(
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
          phone_number: updateUserDto.phoneNumber,
        },
        select: {
          uuid: true,
          username: true,
          email: true,
          country: true,
          address: true,
          phone_number: true,
          created_at: true,
          updated_at: true,
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

  async deleteUser(
    uuid: string,
    tokenUuid: string,
  ): Promise<{ message: string }> {
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
  async findManyUsers(params: GetManyUsersDTO) {
    const skip = (params.page - 1) * params.size || 0;
    const take = parseInt(params.size as unknown as string, 10) || 10; //cast param from String to Number

    return await this.prisma.user.findMany({
      where: {
        username: { contains: params.name, mode: 'insensitive' },
        AND: { status: 'ACTIVE' },
      },
      select: {
        uuid: true,
        username: true,
        email: true,
        country: true,
        address: true,
        phone_number: true,
        created_at: true,
        last_active_at: true,
        status: true,
        role: true,
      },
      skip,
      take,
    });
  }

  async findAllUsers(params: GetAllUsersDTO) {
    const skip = (params.page - 1) * params.size || 0;
    const take = parseInt(params.size as unknown as string, 10) || 10; //cast param from String to Number

    return await this.prisma.user.findMany({
      select: {
        uuid: true,
        username: true,
        email: true,
        country: true,
        address: true,
        phone_number: true,
        created_at: true,
        last_active_at: true,
        status: true,
        role: true,
      },
      skip,
      take,
    });
  }

  async findUserById(uuid: string) {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: {
          uuid: uuid,
        },
        select: {
          uuid: true,
          username: true,
          email: true,
          country: true,
          address: true,
          phone_number: true,
          created_at: true,
          updated_at: true,
          last_active_at: true,
          status: true,
          role: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException();
      }
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  /* HELPER FUNCTIONS 
<------------------------------------------------------------------------------------------------------------------------>
*/

  private async hashPassword(data: string) {
    return hash(data, 10);
  }
}
