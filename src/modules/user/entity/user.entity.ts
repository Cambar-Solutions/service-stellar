import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../../base/entity/base.entity';
import { stringConstants } from '../../../utils/string.constant';
import { SiteEntity } from 'src/modules/site/entity/site.entity';

@Entity('user')
export class UserEntity extends Base {

  @ApiProperty({
    description: 'ID del sitio',
    example: 1,
    type: Number
  })
  @Column({ type: 'int', unsigned: true, name: 'site_id' })
  siteId: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
    type: String
  })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Isaac',
    type: String
  })
  @Column({
    type: 'varchar',
    nullable: false
  })
  name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Jimenez',
    type: String
  })
  @Column({
    name: 'last_name',
    type: 'varchar',
    nullable: false
  })
  lastName: string;

  @ApiProperty({
    description: 'Contraseña del usuario (hash)',
    type: String
  })
  @Column({
    type: 'varchar',
    nullable: true,
    select: false
  })
  password: string;

  @ApiProperty({
    description: 'Número telefónico del usuario',
    example: '5512345678',
    type: String
  })
  @Column({
    name: 'phone_number',
    type: 'varchar',
    nullable: true
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'USER',
    enum: [
      stringConstants.SUPER_ADMIN,
      stringConstants.DIRECTOR,
      stringConstants.MANAGER,
      stringConstants.EMPLOYEE,
    ]
  })
  @Column({
    type: 'enum',
    enum: [
      stringConstants.SUPER_ADMIN,
      stringConstants.DIRECTOR,
      stringConstants.MANAGER,
      stringConstants.EMPLOYEE,
    ],
    default: stringConstants.EMPLOYEE
  })
  role: string;

  @ApiProperty({
    description: 'Estado del usuario',
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
    description: 'Código de verificación/reseteo',
    example: 'ABC123',
    type: String,
    required: false
  })
  @Column({
    type: 'varchar',
    nullable: true
  })
  code: string;

  @ApiProperty({
    description: 'Fecha de generación del código',
    example: '2024-03-20T14:00:00.000Z',
    type: Date,
    required: false
  })  
  @Column({
    name: 'code_generated_at',
    type: 'timestamp',
    nullable: true
  })
  codeCreatedAt: Date;

  @ManyToOne(() => SiteEntity, site => site.users)
  @JoinColumn({ name: 'site_id' })
  site: SiteEntity;
}
