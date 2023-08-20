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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AccessGuard } from 'src/common/guards';
import { UuidMatchGuard } from 'src/common/guards/uuid-match.guard';
import { GetCurrentUserData } from 'src/common/decorators';
import { AdminGuard } from 'src/common/guards/admin.guard';

@ApiTags(SwaggerTags.Users)
@Controller('users')
@ApiBearerAuth()
export class UserServiceController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDTO })
  signup(@Body() createUserDto: CreateUserDTO): Promise<Partial<User>> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(UuidMatchGuard)
  @UseGuards(AccessGuard)
  @Put(':uuid')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDTO,
    @GetCurrentUserData('uuid') tokenUuid: string,
  ): Promise<Partial<User>> {
    return this.userService.update(uuid, updateUserDto, tokenUuid);
  }
  @UseGuards(UuidMatchGuard)
  @UseGuards(AccessGuard)
  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete user' })
  delete(
    @Param('uuid') uuid: string,
    @GetCurrentUserData('uuid') tokenUuid: string,
  ) {
    return this.userService.delete(uuid, tokenUuid);
  }
  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Admin privilege - get all users' })
  findAll() {
    return this.userService.findAll();
  }
  @UseGuards(AdminGuard)
  @Get(':uuid')
  @ApiOperation({ summary: 'Admin privilege - get user by uuid' })
  findOne(@Param('uuid') uuid: string) {
    return this.userService.findOne(uuid);
  }
}
