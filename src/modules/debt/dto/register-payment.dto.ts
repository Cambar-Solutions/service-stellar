import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterPaymentDto {
  @ApiProperty({ description: 'Monto del pago', example: 500.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Tipo de pago',
    enum: ['cash', 'transfer', 'stripe', 'stellar'],
    example: 'cash'
  })
  @IsEnum(['cash', 'transfer', 'stripe', 'stellar'])
  paymentType: string;

  @ApiProperty({ description: 'Notas del pago', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
