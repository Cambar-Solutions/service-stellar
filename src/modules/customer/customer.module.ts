import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './entity/customer.entity';
import { StellarModule } from '../stellar/stellar.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerEntity]),
        StellarModule,
    ],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService, TypeOrmModule],
})
export class CustomerModule {}