import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ValidateIf((obj) => !obj.username) // Validate if username is not provided
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ValidateIf((obj) => !obj.email) // Validate if email is not provided
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
