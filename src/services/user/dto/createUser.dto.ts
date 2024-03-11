import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(3)
  username: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  country?: string;
  @ApiProperty()
  @IsOptional()
  @IsAlphanumeric()
  address?: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
