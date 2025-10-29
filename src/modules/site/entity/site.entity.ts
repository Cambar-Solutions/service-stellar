import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../../base/entity/base.entity';
import { stringConstants } from '../../../utils/string.constant';
import { UserEntity } from 'src/modules/user/entity/user.entity';

@Entity('site')
export class SiteEntity extends Base {

  @ApiProperty({
    description: 'Nombre del sitio',
    example: 'Sucursal Centro',
    type: String
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Descripción del sitio',
    example: 'Sucursal ubicada en el centro de la ciudad',
    type: String,
    required: false
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'RFC del sitio',
    example: 'ABC123456789',
    type: String
  })
  @Column({ type: 'varchar', length: 13 })
  rfc: string;

  @ApiProperty({
    description: 'Dirección del sitio',
    example: 'Av. Juárez 123, Col. Centro',
    type: String
  })
  @Column({ type: 'varchar', length: 200 })
  address: string;

  @ApiProperty({
    description: 'Número telefónico del sitio',
    example: '5512345678',
    type: String
  })
  @Column({ type: 'varchar', length: 13 })
  phone_number: string;

  @ApiProperty({
    description: 'Número de WhatsApp del sitio',
    example: '5512345678',
    type: String
  })
  @Column({ type: 'varchar', length: 13 })
  whatsapp_number: string;

  @ApiProperty({
    description: 'Email del sitio',
    example: 'centro@empresa.com',
    type: String
  })
  @Column({ type: 'varchar', length: 60 })
  email: string;

  @ApiProperty({
    description: 'Fecha de vencimiento',
    example: '2024-12-31',
    type: Date
  })
  @Column({ type: 'date' })
  due_date: Date;

  @ApiProperty({
    description: 'Pago mensual',
    example: 1500.00,
    type: Number
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthly_payment: number;

  @ApiProperty({
    description: 'Moneda',
    example: 'MXN',
    type: String
  })
  @Column({ type: 'char', length: 3 })
  currency: string;

  @ApiProperty({
    description: 'Días de historial de la app',
    example: 180,
    type: Number
  })
  @Column({ type: 'smallint', default: 180 })
  app_history_days: number;

  @ApiProperty({
    description: 'Estado del sitio',
    example: 'ACTIVE',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE]
  })
  @Column({
    type: 'enum',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE],
    default: stringConstants.STATUS_ACTIVE
  })
  status: string;

  @ApiProperty({
    description: 'Código postal',
    example: '06000',
    type: String
  })
  @Column({ type: 'varchar', length: 5 })
  zip_code: string;

  @OneToMany(() => UserEntity, user => user.site)
  users: UserEntity[];

}