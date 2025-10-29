import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDebtDto {
  @ApiProperty({ description: 'ID del sitio', example: 1 })
  @Type(() => Number)
  @IsNumber()
  siteId: number;

  @ApiProperty({ description: 'ID del cliente', example: 1 })
  @Type(() => Number)
  @IsNumber()
  customerId: number;

  @ApiProperty({ description: 'ID del usuario que crea la deuda', example: 1 })
  @Type(() => Number)
  @IsNumber()
  createdByUserId: number;

  @ApiProperty({ description: 'Monto total de la deuda', example: 1500.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    description: 'Monto pagado',
    example: 0,
    required: false,
    default: 0
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @ApiProperty({
    description: 'Monto pendiente por pagar',
    example: 1500.00,
    required: false
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  pendingAmount?: number;

  @ApiProperty({ description: 'Descripción de la deuda', example: 'Mercancía variada', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Estado de la deuda',
    example: 'pending',
    enum: ['pending', 'partial', 'paid', 'cancelled'],
    required: false,
    default: 'pending'
  })
  @IsEnum(['pending', 'partial', 'paid', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Tipo de pago',
    example: 'cash',
    enum: ['stripe', 'cash', 'transfer', 'stellar'],
    required: false
  })
  @IsEnum(['stripe', 'cash', 'transfer', 'stellar'])
  @IsOptional()
  paymentType?: string;

  @ApiProperty({
    description: 'Referencia del pago (ej: Stripe payment intent ID)',
    example: 'pi_xxxxxxxxx',
    required: false
  })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiProperty({
    description: 'Hash de transacción de Stellar',
    example: 'abc123...',
    required: false
  })
  @IsString()
  @IsOptional()
  stellarTxHash?: string;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
