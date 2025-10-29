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
    description: 'Stellar public key del sitio',
    example: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', length: 56, nullable: true, name: 'stellar_public_key' })
  stellarPublicKey: string;

  @ApiProperty({
    description: 'Stellar secret key del sitio (ENCRYPTED)',
    type: String,
    required: false
  })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'stellar_secret_key' })
  stellarSecretKey: string;

  @OneToMany(() => UserEntity, user => user.site)
  users: UserEntity[];

}