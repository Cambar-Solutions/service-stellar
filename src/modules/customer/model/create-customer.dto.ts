import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, IsPositive, IsDateString, Length } from 'class-validator';
import { CreateDto } from '../../base/create.dto';
import { stringConstants } from '../../../utils/string.constant';

export class CreateCustomerDto extends CreateDto {
    @ApiProperty({
        description: 'ID de la compañía',
        example: 1,
        type: Number
      })
      @IsNotEmpty()
      @IsPositive()
      companyId: number;

    @ApiProperty({
        description: 'ID del sitio',
        example: 1,
        type: Number
      })
      @IsNotEmpty()
      @IsPositive()
      siteId: number;

    @ApiProperty({
        description: 'Nombre del cliente',
        example: 'Juan',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Apellido del cliente',
        example: 'Pérez',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({
        description: 'ID del WhatsApp',
        example: '5217773280963',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    waId?: string;

    @ApiProperty({
        description: 'Número telefónico del cliente',
        example: '+52 55 1234 5678',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @ApiProperty({
        description: 'Fecha de nacimiento',
        example: '1990-05-15',
        type: String
    })
    @IsNotEmpty()
    @IsDateString()
    birth_date: string;

    @ApiProperty({
        description: 'Género del cliente',
        example: 'MALE',
        enum: ['MALE', 'FEMALE']
    })
    @IsNotEmpty()
    @IsEnum(['MALE', 'FEMALE'])
    gender: string;

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
    zip_code?: string;

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

    @ApiProperty({
        description: 'ID compuesto: companyId_waId',
        example: '15217773280963',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    companyId_waId?: string;
}