import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { LoginDTO } from './models/dto/login.dto';
import { RegisterDTO } from './models/dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(data: LoginDTO) {
    const user = await this.userService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      siteId: user.siteId,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        siteId: user.siteId,
      },
      access_token,
    };
  }

  async register(data: RegisterDTO) {
    const existingUser = await this.userService.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Split name into firstName and lastName
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

    // user.service.create ya hashea el password, no necesitamos hacerlo aquí
    const newUser = await this.userService.create({
      name: firstName,
      lastName: lastName,
      email: data.email,
      password: data.password, // El password sin hashear, user.service lo hará
      siteId: 1, // Default site for simplified auth
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      message: 'User registered successfully',
    };
  }

  async validate(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        siteId: user.siteId,
      },
    };
  }

  async logout() {
    return {
      message: 'Logout successful',
    };
  }
}
