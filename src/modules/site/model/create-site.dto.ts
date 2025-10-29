import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail, IsNumber, IsDateString, IsPositive, IsInt, Length } from 'class-validator';
import { CreateDto } from '../../base/create.dto';
import { stringConstants } from '../../../utils/string.constant';

export class CreateSiteDto extends CreateDto {
    @ApiProperty({
        description: 'ID de la empresa',
        example: 1,
        type: Number
    })
    @IsNotEmpty()
    @IsPositive()
    companyId: number;

    @ApiProperty({
        description: 'Nombre del sitio',
        example: 'Sucursal Centro',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Descripción del sitio',
        example: 'Sucursal ubicada en el centro de la ciudad',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'RFC del sitio',
        example: 'ABC123456789',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(12, 13)
    rfc: string;

    @ApiProperty({
        description: 'Dirección del sitio',
        example: 'Av. Juárez 123, Col. Centro',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(1, 200)
    address: string;

    @ApiProperty({
        description: 'Número telefónico del sitio',
        example: '5512345678',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(10, 13)
    phone_number: string;

    @ApiProperty({
        description: 'Número de WhatsApp del sitio',
        example: '5512345678',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(10, 13)
    whatsapp_number: string;

    @ApiProperty({
        description: 'Email del sitio',
        example: 'centro@empresa.com',
        type: String
    })
    @IsNotEmpty()
    @IsEmail()
    @Length(1, 60)
    email: string;

    @ApiProperty({
        description: 'Fecha de vencimiento',
        example: '2024-12-31',
        type: String
    })
    @IsNotEmpty()
    @IsDateString()
    due_date: string;

    @ApiProperty({
        description: 'Pago mensual',
        example: 1500.00,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    monthly_payment: number;

    @ApiProperty({
        description: 'Moneda',
        example: 'MXN',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(3, 3)
    currency: string;

    @ApiProperty({
        description: 'Días de historial de la app',
        example: 180,
        type: Number,
        required: false
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    app_history_days?: number;

    @ApiProperty({
        description: 'Estado del sitio',
        example: 'ACTIVE',
        enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE],
        required: false
    })
    @IsOptional()
    @IsEnum([stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE])
    status?: string;

    @ApiProperty({
        description: 'Código postal',
        example: '06000',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(5, 5)
    zip_code: string;
}