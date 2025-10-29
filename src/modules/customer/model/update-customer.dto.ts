import { ApiProperty } from '@nestjs/swagger';
import { UpdateDto } from '../../base/update.dto';
import { stringConstants } from '../../../utils/string.constant';
import { IsNotEmpty, IsPositive, IsString, IsDateString, IsEnum, IsOptional, Length } from 'class-validator';

export class UpdateCustomerDto extends UpdateDto {
  @ApiProperty({
    description: 'ID del sitio',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsPositive()
  siteId?: number;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Número telefónico del cliente',
    example: '+52 55 1234 5678',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@email.com',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Stellar public key del cliente',
    example: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(56, 56)
  stellarPublicKey?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
    type: String,
    required: false
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({
    description: 'Género del cliente',
    example: 'MALE',
    enum: ['MALE', 'FEMALE'],
    required: false
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE'])
  gender?: string;

  @ApiProperty({
    description: 'Dirección del cliente',
    example: 'Calle Principal 123, Col. Centro',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Código postal',
    example: '06000',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(5, 5)
  zipCode?: string;

  @ApiProperty({
    description: 'Notas adicionales sobre el cliente',
    example: 'Cliente frecuente, prefiere entregas por la mañana',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Estado del cliente',
    example: 'ACTIVE',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE],
    required: false
  })
  @IsOptional()
  @IsEnum([stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE])
  status?: string;
}
