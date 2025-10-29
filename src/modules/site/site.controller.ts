import { Controller, Get, Post, Put, Body, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CreateSiteDto } from './model/create-site.dto';
import { UpdateSiteDto } from './model/update-site.dto';
import { BaseController } from '../base/base.controller';
import { SiteEntity } from './entity/site.entity';

@ApiTags('Sites')
@Controller('sites')
export class SiteController extends BaseController<SiteEntity, CreateSiteDto, UpdateSiteDto> {
  protected service: SiteService;
  protected entityName = 'site';

  constructor(private readonly siteService: SiteService) {
    super();
    this.service = this.siteService;
  }

  // Todos los métodos básicos se heredan de BaseController
  // No hay endpoints específicos adicionales para Site en este momento
}