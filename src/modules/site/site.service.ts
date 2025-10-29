import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteEntity } from './entity/site.entity';
import { CreateSiteDto } from './model/create-site.dto';
import { UpdateSiteDto } from './model/update-site.dto';
import { stringConstants } from '../../utils/string.constant';
import {
  NotFoundCustomException,
  NotFoundCustomExceptionType,
} from '../../common/exceptions/types/notFound.exception';
import { HandleException } from '../../common/exceptions/handler/handle.exception';
import { BaseService } from '../base/base.service';

@Injectable()
export class SiteService extends BaseService<SiteEntity, CreateSiteDto, UpdateSiteDto> {
  protected repository: Repository<SiteEntity>;
  protected notFoundExceptionType = NotFoundCustomExceptionType.SITE;

  constructor(
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
  ) {
    super();
    this.repository = this.siteRepository;
  }

  protected getDefaultRelations(): { relations?: string[] } {
    return { relations: ['company', 'siteStyles'] };
  }

  // Los métodos básicos (findAll, findAllActive, findById, create, update, updateStatus, delete)
  // se heredan de BaseService

  // No hay métodos específicos adicionales para Site en este momento

}