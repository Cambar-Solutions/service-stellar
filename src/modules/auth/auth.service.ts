import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { comparePasswords } from '../../utils/password.utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
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
} 