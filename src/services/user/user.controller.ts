import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AccessGuard } from 'src/common/guards';

@ApiTags(SwaggerTags.Users)
@Controller('user')
export class UserServiceController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDTO })
  signup(@Body() createUserDto: CreateUserDTO): Promise<Partial<User>> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AccessGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') uuid: string, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(uuid, updateUserDto);
  }

  @UseGuards(AccessGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  delete(@Param('id') uuid: string) {
    return this.userService.delete(uuid);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') uuid: string) {
    return this.userService.findOne(uuid);
  }
}
