import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { UserService } from './services/user.service';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AccessGuard } from 'src/common/guards';
import { UuidMatchGuard } from 'src/common/guards/uuid-match.guard';
import { GetCurrentUserData } from 'src/common/decorators';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { GetAllUsersDTO, GetManyUsersDTO } from './dto/getUsers.dto';

@ApiTags(SwaggerTags.Users)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDTO })
  createUser(@Body() createUserDto: CreateUserDTO): Promise<Partial<User>> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(UuidMatchGuard)
  @UseGuards(AccessGuard)
  @Put(':uuid')
  @ApiOperation({ summary: 'Update user' })
  updateUser(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDTO,
    @GetCurrentUserData('uuid') tokenUuid: string,
  ): Promise<Partial<User>> {
    return this.userService.updateUser(uuid, updateUserDto, tokenUuid);
  }

  @UseGuards(UuidMatchGuard)
  @UseGuards(AccessGuard)
  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete user' })
  deleteUser(@Param('uuid') uuid: string, @GetCurrentUserData('uuid') tokenUuid: string) {
    return this.userService.deleteUser(uuid, tokenUuid);
  }

  @UseGuards(AccessGuard)
  @Get('user')
  @ApiOperation({ summary: 'Search for user by username' })
  findManyUsers(@Query() queryParams: GetManyUsersDTO) {
    return this.userService.findManyUsers(queryParams);
  }

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Admin privilege - get all users' })
  findAllUsers(@Query() queryParams: GetAllUsersDTO) {
    return this.userService.findAllUsers(queryParams);
  }

  @UseGuards(AdminGuard)
  @Get(':uuid')
  @ApiOperation({ summary: 'Admin privilege - get user by uuid' })
  findUserByid(@Param('uuid') uuid: string) {
    return this.userService.findUserById(uuid);
  }
}
