import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../../base/entity/base.entity';
import { SiteEntity } from '../../site/entity/site.entity';
import { CustomerEntity } from '../../customer/entity/customer.entity';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('debt')
export class DebtEntity extends Base {

  @ApiProperty({
    description: 'ID del sitio',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'site_id' })
  siteId: number;

  @ApiProperty({
    description: 'ID del cliente',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'customer_id' })
  customerId: number;

  @ApiProperty({
    description: 'ID del usuario que creó la deuda',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'created_by_user_id' })
  createdByUserId: number;

  @ApiProperty({
    description: 'Monto total de la deuda',
    example: 1500.00,
    type: Number
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @ApiProperty({
    description: 'Monto pagado',
    example: 500.00,
    type: Number
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'paid_amount' })
  paidAmount: number;

  @ApiProperty({
    description: 'Monto pendiente por pagar',
    example: 1000.00,
    type: Number
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'pending_amount' })
  pendingAmount: number;

  @ApiProperty({
    description: 'Descripción de la deuda',
    example: 'Mercancía variada',
    type: String,
    required: false
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Estado de la deuda',
    example: 'pending',
    enum: ['pending', 'partial', 'paid', 'cancelled']
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'partial', 'paid', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @ApiProperty({
    description: 'Tipo de pago',
    example: 'cash',
    enum: ['stripe', 'cash', 'transfer', 'stellar'],
    required: false
  })
  @Column({
    type: 'enum',
    enum: ['stripe', 'cash', 'transfer', 'stellar'],
    nullable: true,
    name: 'payment_type'
  })
  paymentType: string;

  @ApiProperty({
    description: 'Referencia del pago (ej: Stripe payment intent ID)',
    example: 'pi_xxxxxxxxx',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', nullable: true, name: 'payment_reference' })
  paymentReference: string;

  @ApiProperty({
    description: 'Hash de transacción de Stellar',
    example: 'abc123...',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', length: 64, nullable: true, name: 'stellar_tx_hash' })
  stellarTxHash: string;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Cliente pagó la mitad en efectivo',
    type: String,
    required: false
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => SiteEntity)
  @JoinColumn({ name: 'site_id' })
  site: SiteEntity;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: UserEntity;
}
