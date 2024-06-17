import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UnBlockUserDto {
  @ApiProperty({
    required: false,
    description: 'id for the user you want to block',
  })
  @IsNumber()
  @IsNotEmpty()
  unblockUserId: number;
}
