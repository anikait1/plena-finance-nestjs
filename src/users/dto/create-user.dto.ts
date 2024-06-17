import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({
    required: true,
    description:
      'uniquely identifable text for each user, cannot be same for two users',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true, example: '1999-05-20' })
  @IsDateString() // YYYY-MM-DD
  @IsNotEmpty()
  birthdate: Date;
}
