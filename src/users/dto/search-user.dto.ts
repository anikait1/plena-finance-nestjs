import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsString } from 'class-validator';
import { ReadUserDto } from './read-user.dto';
import { Transform } from 'class-transformer';

export class SearchUserDto extends ReadUserDto {
  @ApiProperty({
    required: false,
    description: 'partial/full username to search for',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    required: false,
    description: 'minimum age range to filter users on',
  })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  minAge?: number;

  @ApiProperty({
    required: false,
    description: 'maximum age range to filter users on',
  })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  maxAge?: number;
}
