import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { CreateDto } from '../../base/create.dto';
import { stringConstants } from '../../../utils/string.constant';

export class CreateUserDto extends CreateDto {

  @ApiProperty({
    description: 'ID del sitio',
    example: 1,
    type: Number
  })
  @IsNotEmpty()
  @IsPositive()
  siteId: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
    type: String
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Isaac',
    type: String
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Jimenez',
    type: String
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Contraseña123',
    type: String
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Número telefónico del usuario',
    example: '+527773280963',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'EMPLOYEE',
    enum: [
      stringConstants.SUPER_ADMIN,
      stringConstants.DIRECTOR,
      stringConstants.MANAGER,
      stringConstants.EMPLOYEE,
    ],
    required: false
  })
  @IsOptional()
  @IsEnum([
    stringConstants.SUPER_ADMIN,
    stringConstants.DIRECTOR,
    stringConstants.MANAGER,
    stringConstants.EMPLOYEE,
  ])
  role?: string;

  @ApiProperty({
    description: 'Estado del usuario',
    example: 'ACTIVE',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE],
    required: false
  })
  @IsOptional()
  @IsEnum([stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE])
  status?: string;
}
