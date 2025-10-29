import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { SiteEntity } from './entity/site.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SiteEntity])],
    controllers: [SiteController],
    providers: [SiteService],
    exports: [SiteService, TypeOrmModule],
})
export class SiteModule {}