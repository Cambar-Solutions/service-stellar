import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({ description: 'ID del usuario' })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Nueva contraseña' })
  @IsString()
  @IsNotEmpty()
  password: string;
} 