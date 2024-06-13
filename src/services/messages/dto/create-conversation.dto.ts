import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isParticipantsValid', async: false })
class PrivateConversationConstraint implements ValidatorConstraintInterface {
  validate(participants: string[], args: ValidationArguments) {
    const dto = args.object as CreateConversationDto;
    if (!dto.publicChat && participants.length != 1) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'There can be only 1 participant if the conversation is private.';
  }
}

function IsParticipantsCountValid(validationOptions?: any) {
  return Validate(PrivateConversationConstraint, validationOptions);
}

export class CreateConversationDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsParticipantsCountValid()
  participants: string[];
  @ApiPropertyOptional()
  @IsOptional()
  publicChat?: boolean = false;
}
