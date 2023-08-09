import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AccessGuard } from 'src/common/guards';
import { AuthLoggingInterceptor } from 'src/common/interceptors/auth-logging.interceptor';

@ApiTags(SwaggerTags.Users)
@Controller('user')
@ApiBearerAuth()
export class UserServiceController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDTO })
  signup(@Body() createUserDto: CreateUserDTO): Promise<Partial<User>> {
    return this.userService.createUser(createUserDto);
  }

  @UseInterceptors(AuthLoggingInterceptor)
  @UseGuards(AccessGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') uuid: string, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(uuid, updateUserDto);
  }

  @UseInterceptors(AuthLoggingInterceptor)
  @UseGuards(AccessGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  delete(@Param('id') uuid: string) {
    return this.userService.delete(uuid);
  }
  @Get()
  @ApiOperation({ summary: 'TODO' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'TODO' })
  findOne(@Param('id') uuid: string) {
    return this.userService.findOne(uuid);
  }
}
