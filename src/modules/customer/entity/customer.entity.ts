import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../../base/entity/base.entity';
import { stringConstants } from '../../../utils/string.constant';
import { SiteEntity } from '../../site/entity/site.entity';
@Entity('customer')
export class CustomerEntity extends Base {

  @ApiProperty({
    description: 'ID del sitio',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'site_id', nullable: true })
  siteId: number;


  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
    type: String
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Número telefónico del cliente',
    example: '+52 55 1234 5678',
    type: String
  })
  @Column({ type: 'varchar', name: 'phone_number' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'juan@example.com',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', nullable: true })
  email: string;

  @ApiProperty({
    description: 'Stellar public key del cliente',
    example: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', length: 56, nullable: true, name: 'stellar_public_key' })
  stellarPublicKey: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
    type: Date
  })
  @Column({ type: 'date', name: 'birth_date' })
  birthDate: Date;

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
  zipCode: string;

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