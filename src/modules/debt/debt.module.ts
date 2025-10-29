import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { DebtEntity } from './entities/debt.entity';
import { SiteEntity } from '../site/entity/site.entity';
import { CustomerEntity } from '../customer/entity/customer.entity';
import { UserEntity } from '../user/entity/user.entity';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DebtEntity,
      SiteEntity,
      CustomerEntity,
      UserEntity
    ]),
    StellarModule,
  ],
  controllers: [DebtController],
  providers: [DebtService],
  exports: [DebtService, TypeOrmModule],
})
export class DebtModule {}
