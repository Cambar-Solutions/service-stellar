import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SiteService } from '../site/site.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { comparePasswords } from '../../utils/password.utils';
import { stringConstants } from '../../utils/string.constant';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private siteService: SiteService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await comparePasswords(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener el company y sus styles
    const company = user.site?.company || null;
    const companyStyle = company?.styles?.[0] || null;

    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      site_id: user.siteId
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        siteId: user.siteId,
        site: user.site ? {
          id: user.site.id,
          name: user.site.name,
          description: user.site.description,
          company: company ? {
            id: company.id,
            name: company.name
          } : null
        } : null,
        style: companyStyle ? {
          id: companyStyle.id,
          logoUrl: companyStyle.logoUrl,
          logoAltText: companyStyle.logoAltText,
          navbarActiveColor: companyStyle.navbarActiveColor,
          navbarHoverColor: companyStyle.navbarHoverColor,
          firePrimaryColor: companyStyle.firePrimaryColor,
          fireSecondaryColor: companyStyle.fireSecondaryColor,
          fireAccentColor: companyStyle.fireAccentColor,
          fireTertiaryColor: companyStyle.fireTertiaryColor,
          scrollbarThumbStartColor: companyStyle.scrollbarThumbStartColor,
          scrollbarThumbEndColor: companyStyle.scrollbarThumbEndColor,
          scrollbarThumbHoverStartColor: companyStyle.scrollbarThumbHoverStartColor,
          scrollbarThumbHoverEndColor: companyStyle.scrollbarThumbHoverEndColor
        } : null
      }
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar si el email ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear el Site (negocio)
    const site = await this.siteService.create({
      name: registerDto.businessName,
      status: stringConstants.STATUS_ACTIVE,
    });

    // Dividir el nombre completo en nombre y apellido
    const nameParts = registerDto.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

    // Crear el usuario con rol DIRECTOR
    // user.service.ts ya hashea la contraseña automáticamente en el método create()
    const user = await this.usersService.create({
      email: registerDto.email,
      name: firstName,
      lastName: lastName,
      password: registerDto.password, // NO hashear aquí, user.service lo hace
      siteId: site.id,
      role: stringConstants.DIRECTOR,
      status: stringConstants.STATUS_ACTIVE,
    });

    // Retornar el usuario sin la contraseña
    const { password, ...userWithoutPassword } = user;
    return {
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword,
      site: {
        id: site.id,
        name: site.name,
      }
    };
  }
} 