import { Controller, Get, Post, Put, Body, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CreateSiteDto } from './model/create-site.dto';
import { UpdateSiteDto } from './model/update-site.dto';
import { BaseController } from '../base/base.controller';
import { SiteEntity } from './entity/site.entity';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Sites')
@Controller('sites')
export class SiteController extends BaseController<SiteEntity, CreateSiteDto, UpdateSiteDto> {
  protected service: SiteService;
  protected entityName = 'site';

  constructor(private readonly siteService: SiteService) {
    super();
    this.service = this.siteService;
  }

  @Public()
  @Get('public/:id')
  @ApiOperation({ summary: 'Get public site information for public view' })
  @ApiParam({ name: 'id', type: Number, description: 'Site ID' })
  @ApiResponse({ status: 200, description: 'Site public data retrieved successfully' })
  async getPublicSiteInfo(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.getPublicSiteInfo(id);
  }
}