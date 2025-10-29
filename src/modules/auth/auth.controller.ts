import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException, 
  Res, 
  Get,
  UseGuards,
  Req,
  ForbiddenException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { SessionService } from './session.service';
import { SessionGuard } from './guards/session.guard';
import { UserService } from '../user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly usersService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request
  ) {
    try {
      const result = await this.authService.login(loginDto);
      
      // Obtener información del cliente para fingerprinting
      const clientIp = this.getClientIp(request);
      const userAgent = request.get('User-Agent') || '';
      
      // Crear sesión en lugar de JWT
      const sessionId = this.sessionService.createSession({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
        lastName: result.user.lastName,
        siteId: result.user.siteId,
        site_id: result.user.siteId, // Compatibility
        ip: clientIp,
        userAgent: userAgent,
      });
      
      // Configurar cookie con session ID
      response.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      });

      // Retornar toda la información del usuario para el frontend
      const loginResponse = {
        message: 'Login exitoso',
        user: result.user // Incluye toda la info del AuthService
      };
      
      // console.log('[AUTH CONTROLLER] Sending response:', JSON.stringify(loginResponse, null, 2));
      return loginResponse;
    } catch (error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  @Get('validate')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Validar sesión y obtener información del usuario' })
  @ApiResponse({ status: 200, description: 'Sesión válida' })
  @ApiResponse({ status: 401, description: 'Sesión inválida' })
  async validateSession(@Req() req: any) {
    // Obtener información completa del usuario desde la base de datos
    const fullUser = await this.usersService.findByIdWithDetails(req.user.userId);

    return {
      message: 'Sesión válida',
      user: {
        id: fullUser?.id,
        email: fullUser?.email,
        name: fullUser?.name,
        lastName: fullUser?.lastName,
        role: fullUser?.role,
        siteId: fullUser?.siteId,
        site: fullUser?.site ? {
          id: fullUser?.site.id,
          name: fullUser.site.name,
          description: fullUser.site.description,
        } : null,
      }
    };
  }

  @Post('check-permission')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Verificar permisos del usuario' })
  @ApiResponse({ status: 200, description: 'Permisos verificados' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async checkPermission(
    @Body() body: { userId: number; resource: string; action: string; role: string },
    @Req() req: any
  ) {
    // Verificar que el usuario que hace la consulta coincida con el de la sesión
    if (req.user.userId !== body.userId) {
      throw new ForbiddenException('No autorizado para verificar permisos de otro usuario');
    }

    // Obtener el rol real del usuario desde la base de datos
    const user = await this.usersService.findById(body.userId);
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    // Verificar permisos basado en roles (puedes expandir esta lógica según tus necesidades)
    const hasPermission = this.checkUserPermission(user.role, body.resource, body.action);
    
    return {
      hasPermission,
      userRole: user.role
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request
  ) {
    const sessionId = request.cookies?.session_id;
    
    if (sessionId) {
      this.sessionService.destroySession(sessionId);
    }
    
    response.clearCookie('session_id');
    return { message: 'Logout exitoso' };
  }

  @Get('sessions/stats')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Estadísticas de sesiones (solo para debug)' })
  async getSessionStats() {
    return this.sessionService.getStats();
  }

  private checkUserPermission(role: string, resource: string, action: string): boolean {
    // Lógica básica de permisos - puedes expandir según tus necesidades
    const permissions = {
      'SUPER_ADMIN': ['*'], // Acceso total
      'DIRECTOR': ['users', 'products', 'orders', 'categories', 'customers'],
      'MANAGER': ['products', 'orders', 'categories', 'customers'],
      'EMPLOYEE': ['orders', 'customers']
    };

    const userPermissions = permissions[role] || [];
    return userPermissions.includes('*') || userPermissions.includes(resource);
  }

  private getClientIp(request: Request): string {
    return (request as any).ip || 
           (request as any).connection?.remoteAddress || 
           (request as any).socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.toString().split(',')[0] ||
           '127.0.0.1';
  }
}