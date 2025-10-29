import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../../base/entity/base.entity';
import { stringConstants } from '../../../utils/string.constant';
import { SiteEntity } from '../../site/entity/site.entity';
@Entity('customer')
export class CustomerEntity extends Base {

  @ApiProperty({
    description: 'ID de la compañía',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'company_id'})
  companyId: number;

  @ApiProperty({
    description: 'ID del sitio',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'site_id', nullable: true })
  siteId: number;

  @ApiProperty({
    description: 'ID del whatsapp',
    example: '1234567890',
    type: String
  })
  @Column({ type: 'varchar', length: 255, name: 'wa_id', nullable: true })
  waId: string;

  @ApiProperty({
    description: 'ID compuesto: companyId_waId',
    example: '15217773280963',
    type: String
  })
  @Column({ type: 'varchar', length: 255, name: 'company_id_wa_id', nullable: true, unique: true })
  companyId_waId: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
    type: String
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
    type: String
  })
  @Column({ type: 'varchar', name: 'last_name' })
  last_name: string;

  @ApiProperty({
    description: 'Número telefónico del cliente',
    example: '+52 55 1234 5678',
    type: String
  })
  @Column({ type: 'varchar', name: 'phone_number' })
  phone_number: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
    type: Date
  })
  @Column({ type: 'date', name: 'birth_date' })
  birth_date: Date;

  @ApiProperty({
    description: 'Género del cliente',
    example: 'MALE',
    enum: ['MALE', 'FEMALE']
  })
  @Column({
    type: 'enum',
    enum: ['MALE', 'FEMALE']
  })
  gender: string;

  @ApiProperty({
    description: 'Dirección del cliente',
    example: 'Calle Principal 123, Col. Centro',
    type: String,
    required: false
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({
    description: 'Código postal',
    example: '06000',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', nullable: true, name: 'zip_code' })
  zip_code: string;

  @ApiProperty({
    description: 'Notas adicionales sobre el cliente',
    example: 'Cliente frecuente, prefiere entregas por la mañana',
    type: String,
    required: false
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Estado del cliente',
    example: 'ACTIVE',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE]
  })
  @Column({
    type: 'enum',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE],
    default: stringConstants.STATUS_ACTIVE
  })
  status: string;

  @ManyToOne(() => SiteEntity)
  @JoinColumn({ name: 'site_id' })
  site: SiteEntity;
  
}