import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingPaymentService } from './pending-payment.service';
import { PendingPaymentController } from './pending-payment.controller';
import { PendingPaymentEntity } from './entities/pending-payment.entity';
import { DebtEntity } from '../debt/entities/debt.entity';
import { DebtModule } from '../debt/debt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingPaymentEntity, DebtEntity]),
    DebtModule,
  ],
  controllers: [PendingPaymentController],
  providers: [PendingPaymentService],
  exports: [PendingPaymentService],
})
export class PendingPaymentModule {}
