import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  username: string;
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
