import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../../base/entity/base.entity';
import { DebtEntity } from '../../debt/entities/debt.entity';
import { CustomerEntity } from '../../customer/entity/customer.entity';

@Entity('pending_payment')
export class PendingPaymentEntity extends Base {

  @ApiProperty({
    description: 'ID de la deuda asociada',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'debt_id' })
  debtId: number;

  @ApiProperty({
    description: 'ID del cliente que realiza el pago',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'customer_id' })
  customerId: number;

  @ApiProperty({
    description: 'Monto del pago',
    example: 500.00,
    type: Number
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Tipo de pago',
    example: 'stellar',
    enum: ['cash', 'transfer', 'stripe', 'stellar']
  })
  @Column({
    type: 'enum',
    enum: ['cash', 'transfer', 'stripe', 'stellar'],
    name: 'payment_type'
  })
  paymentType: string;

  @ApiProperty({
    description: 'Referencia o concepto del pago',
    example: 'Pago parcial abono 1',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @ApiProperty({
    description: 'Notas adicionales sobre el pago',
    example: 'Pago desde vista pública - TxHash: abc123...',
    type: String,
    required: false
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Estado del pago pendiente',
    example: 'pending',
    enum: ['pending', 'approved', 'rejected']
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: string;

  @ApiProperty({
    description: 'Hash de transacción de Stellar (si aplica)',
    example: 'abc123...',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', length: 64, nullable: true, name: 'stellar_tx_hash' })
  stellarTxHash: string;

  @ManyToOne(() => DebtEntity)
  @JoinColumn({ name: 'debt_id' })
  debt: DebtEntity;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
}
