import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UpdateDto } from '../../base/update.dto';
import { ApiProperty } from '@nestjs/swagger';
import { stringConstants } from '../../../utils/string.constant';

export class UpdateSiteDto extends UpdateDto {
  @ApiProperty({
    description: 'Nombre del sitio',
    example: 'Sucursal Centro',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Estado del sitio',
    example: 'ACTIVE',
    enum: [stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE],
    required: false
  })
  @IsOptional()
  @IsEnum([stringConstants.STATUS_ACTIVE, stringConstants.STATUS_INACTIVE])
  status?: string;

  @ApiProperty({
    description: 'Stellar public key del sitio',
    example: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(56, 56)
  stellarPublicKey?: string;

  @ApiProperty({
    description: 'Stellar secret key del sitio (ENCRYPTED)',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  stellarSecretKey?: string;
}
