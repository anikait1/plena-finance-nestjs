import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsPositive } from 'class-validator';

export class ReadUserDto {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 10;

  @ApiProperty({
    required: false,
    description: 'flag to indicate whether to include the current user or not',
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    value = value?.toLowerCase();
    if (value === 'true') return true;
    else if (value === 'false') return false;
  })
  includeCurrentUser: boolean = false;
}
