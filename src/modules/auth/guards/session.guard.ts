import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.session_id;
    
    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const clientIp = this.getClientIp(request);
    const userAgent = request.get('User-Agent') || '';
    
    const sessionData = this.sessionService.validateSession(sessionId, clientIp, userAgent);
    
    if (!sessionData) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Adjuntar datos de usuario al request
    request.user = {
      id: sessionData.userId,
      userId: sessionData.userId, // Add for compatibility
      email: sessionData.email,
      role: sessionData.role,
      name: sessionData.name,
      siteId: sessionData.siteId || sessionData.site_id,
      site_id: sessionData.site_id || sessionData.siteId,
    };

    return true;
  }

  private getClientIp(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
           '127.0.0.1';
  }
}