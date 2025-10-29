import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { SiteEntity } from './entity/site.entity';
import { CustomerEntity } from '../customer/entity/customer.entity';
import { DebtEntity } from '../debt/entities/debt.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SiteEntity, CustomerEntity, DebtEntity])],
    controllers: [SiteController],
    providers: [SiteService],
    exports: [SiteService, TypeOrmModule],
})
export class SiteModule {}