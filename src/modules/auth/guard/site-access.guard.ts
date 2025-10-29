import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/user/user.service';

export const SKIP_SITE_ACCESS_KEY = 'skipSiteAccess';

@Injectable()
export class SiteAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route should skip site access validation
    const skipSiteAccess = this.reflector.getAllAndOverride<boolean>(
      SKIP_SITE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipSiteAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Extract siteId from params, query, or body
    const siteId = this.extractSiteId(request);

    if (!siteId) {
      // If no siteId found, skip validation (some endpoints don't need it)
      return true;
    }

    // Validate user has access to this site
    await this.validateSiteAccess(Number(siteId), user.id);

    return true;
  }

  private extractSiteId(request: any): number | null {
    // Try to get siteId from different sources
    if (request.params?.siteId) {
      return Number(request.params.siteId);
    }
    if (request.query?.siteId) {
      return Number(request.query.siteId);
    }
    if (request.body?.siteId) {
      return Number(request.body.siteId);
    }
    return null;
  }

  private async validateSiteAccess(
    siteId: number,
    userId: number,
  ): Promise<void> {
    // Simplified: just check if user exists
    const authUser = await this.userService.findById(userId);
    if (!authUser) {
      throw new UnauthorizedException('User not found');
    }

    // In simplified auth, we allow access to all sites
    return;
  }
}
