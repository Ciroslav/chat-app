import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { LoginDto } from '../../auth-service/dto/login.dto';

@Injectable()
export class LoginDtoValidatorPipe implements PipeTransform {
  transform(value: LoginDto) {
    const { email, username, password } = value as LoginDto;

    if (!email && !username) {
      throw new BadRequestException(
        'Either email or username must be provided.',
      );
    }

    const validatedDto: Partial<LoginDto> = {};

    if (email) {
      validatedDto.email = email;
    }

    if (username) {
      validatedDto.username = username;
    }

    validatedDto.password = password;

    return validatedDto as LoginDto;
  }
}
