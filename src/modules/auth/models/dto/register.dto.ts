import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({ description: 'name', example: 'John Doe' })
  @Transform(({ value }) => value.trim())
  @IsString()
  name: string;

  @ApiProperty({ description: 'email', example: 'user@example.com' })
  @Transform(({ value }) => value.trim())
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password', example: '********', minimum: 8 })
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(8)
  password: string;
}
