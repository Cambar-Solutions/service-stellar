import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionService } from './session.service';
import { SessionGuard } from './guards/session.guard';
import { RoleGuard } from './guards/role.guard';
import { CustomLoggerService } from '../../common/logger/logger.service';
@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'maizimo-secret-key-2024',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionService, SessionGuard, RoleGuard, CustomLoggerService, UserService],
  exports: [AuthService, JwtStrategy, SessionService, SessionGuard, RoleGuard],
})
export class AuthModule {} 