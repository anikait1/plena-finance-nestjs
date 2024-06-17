import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({
    required: true,
    description: 'id for the user you want to block',
  })
  @IsNumber()
  @IsNotEmpty()
  blockUserId: number;
}
