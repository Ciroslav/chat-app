import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

//TODO Add validation pipe for date, can not be higher than current
//NOTE Maximum of 10 participants in conversation can be circumvented by spanning Update conversation with new users
export class UpdateConversationDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  participants: string[];
  @Optional()
  @ApiPropertyOptional()
  limitedAccess?: boolean = false;
  @Optional()
  @ApiPropertyOptional()
  @IsString()
  accessSince?: string;
}
