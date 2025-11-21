import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePendingPaymentDto {
  @ApiProperty({ description: 'ID de la deuda', example: 1 })
  @Type(() => Number)
  @IsNumber()
  debtId: number;

  @ApiProperty({ description: 'ID del cliente', example: 1 })
  @Type(() => Number)
  @IsNumber()
  customerId: number;

  @ApiProperty({ description: 'Monto del pago', example: 500.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Tipo de pago',
    enum: ['cash', 'transfer', 'stripe', 'stellar'],
    example: 'stellar'
  })
  @IsEnum(['cash', 'transfer', 'stripe', 'stellar'])
  paymentType: string;

  @ApiProperty({ description: 'Referencia o concepto', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: 'Notas del pago', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Hash de transacción Stellar', required: false })
  @IsString()
  @IsOptional()
  stellarTxHash?: string;
}
