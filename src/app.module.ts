import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import typeOrmConfig from './config/type.orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CustomLoggerService } from './common/logger/logger.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { UserModule } from './modules/user/user.module';
import { SiteModule } from './modules/site/site.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DebtModule } from './modules/debt/debt.module';
import { StellarModule } from './modules/stellar/stellar.module';
import { PendingPaymentModule } from './modules/pending-payment/pending-payment.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    typeOrmConfig,
    AuthModule,
    UserModule,
    SiteModule,
    CustomerModule,
    DebtModule,
    StellarModule,
    PendingPaymentModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },],
})
export class AppModule {
  constructor() {}
}
