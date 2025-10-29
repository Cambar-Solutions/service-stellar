import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { LoginDTO } from './models/dto/login.dto';
import { RegisterDTO } from './models/dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

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
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      access_token,
    };
  }

  async register(data: RegisterDTO) {
    const existingUser = await this.userService.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const newUser = await this.userService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
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
      },
    };
  }

  async logout() {
    return {
      message: 'Logout successful',
    };
  }
}
