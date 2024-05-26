import { IsEmail, IsNotEmpty, MinLength, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ValidateIf((obj) => !obj.username) // Validate if username is not provided
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ValidateIf((obj) => !obj.email) // Validate if email is not provided
  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
