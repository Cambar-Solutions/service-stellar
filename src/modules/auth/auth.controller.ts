import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './models/dto/login.dto';
import { RegisterDTO } from './models/dto/register.dto';
import { AuthGuard } from './guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDTO })
  login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiBody({ type: RegisterDTO })
  register(@Body() registerDto: RegisterDTO) {
    return this.authService.register(registerDto);
  }

  @Get('validate')
  validate(@Request() req) {
    return this.authService.validate(req.user.id);
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }
}
