import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface SessionData {
  userId: number;
  email: string;
  role: string;
  name: string;
  lastName?: string;
  siteId?: number;
  site_id?: number; // Compatibilidad
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
}

@Injectable()
export class SessionService {
  private sessions = new Map<string, SessionData>();
  private readonly SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 días

  // Crear nueva sesión
  createSession(userData: Omit<SessionData, 'createdAt' | 'lastActivity'>): string {
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    this.sessions.set(sessionId, {
      ...userData,
      createdAt: new Date(),
      lastActivity: new Date(),
    });

    return sessionId;
  }

  // Validar sesión
  validateSession(sessionId: string, ip: string, userAgent: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Verificar timeout
    const now = new Date();
    if (now.getTime() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Verificar IP y User-Agent para mayor seguridad (más relajado en desarrollo)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (!isDevelopment && (session.ip !== ip || session.userAgent !== userAgent)) {
      console.warn(`Session hijack attempt detected for session ${sessionId}`);
      this.sessions.delete(sessionId);
      return null;
    }
    
    // En desarrollo, solo avisar pero no invalidar sesión
    if (isDevelopment && (session.ip !== ip || session.userAgent !== userAgent)) {
      console.log(`IP/UserAgent changed in development for session ${sessionId.substring(0, 8)}...`);
    }

    // Actualizar última actividad
    session.lastActivity = new Date();
    this.sessions.set(sessionId, session);

    return session;
  }

  // Destruir sesión
  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // Destruir todas las sesiones de un usuario
  destroyUserSessions(userId: number): number {
    let count = 0;
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of entries) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    return count;
  }

  // Limpiar sesiones expiradas (puedes llamar esto periódicamente)
  cleanExpiredSessions(): number {
    const now = new Date();
    let cleaned = 0;
    const entries = Array.from(this.sessions.entries());
    
    for (const [sessionId, session] of entries) {
      if (now.getTime() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Obtener información de sesión sin validar (para debug)
  getSessionInfo(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  // Obtener estadísticas
  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        id: id.substring(0, 8) + '...',
        userId: session.userId,
        email: session.email,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
      }))
    };
  }
}