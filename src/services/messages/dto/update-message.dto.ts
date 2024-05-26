import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;
}
