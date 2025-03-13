import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

const envPath = path.join(
  process.cwd(),
  process.env.NODE_ENV ? `envs/.env.${process.env.NODE_ENV}` : `/.env`,
);
dotenv.config({
  path: envPath,
});

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    const authorization = String(request.headers['authorization']);
    if (!authorization || authorization === null)
      return (await super.canActivate(context)) as boolean;
    const authToken = authorization.split(' ')[1];
        
    const isBlackListedToken = await this.cacheManager.get(`blacklist:${authToken}`);
    console.log('isBlackListedToken', isBlackListedToken);
    if(isBlackListedToken) {
      return (await this.canActivate(context)) as boolean;
    }
    const tokenSecret = `${process.env.JWT_SECRET}`;
    console.log('authorization', authToken, tokenSecret);
    if (authToken === tokenSecret) {
      if (request.headers.user) {
        request.user = JSON.parse(request.headers['user']);
      }
      return true;
    }
    console.log('userAgent', request.headers['user-agent']);
    return (await super.canActivate(context)) as boolean;
  }
}
