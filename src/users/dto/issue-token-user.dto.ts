import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class IssueTokenUser {
  @ApiProperty({
    required: true,
    description: 'User Id of token you want to issue token for',
  })
  @IsNumber()
  userId: number;
}
