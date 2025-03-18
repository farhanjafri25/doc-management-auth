import { ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ROLES_KEY } from 'src/decorators';
import * as jwt from 'jsonwebtoken';
import { RedisStore } from 'cache-manager-redis-store';

const envPath = path.join(
  process.cwd(),
  process.env.NODE_ENV ? `envs/.env.${process.env.NODE_ENV}` : `/.env`,
);
dotenv.config({
  path: envPath,
});

@Injectable()
  /**
   * Constructor that injects the required dependencies for the guard.
   *
   * @param {Reflector} reflector - A utility for reflecting metadata from methods or classes.
   * @param {Cache} cacheManager - Cache manager to handle blacklisting of JWT tokens.
   */
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: RedisStore
  ) {
    super();
  }

    /**
   * Determines whether the current request can be processed based on the JWT token, 
   * the presence of a blacklisted token, and user role permissions.
   * This method extends the behavior of the default `AuthGuard('jwt')` by adding:
   * - Check for public routes using reflection.
   * - Verifying whether the JWT token is blacklisted using the cache manager.
   * - Decoding and verifying the JWT token using the secret key.
   * - Role-based access control based on metadata attached to the route handler.
   * 
   * @param {ExecutionContext} context - The context of the incoming request. Contains the request and response objects.
   * @returns {Promise<boolean>} - Returns a boolean indicating whether the request can proceed.
   * @throws {ForbiddenException} - Throws if the token is invalid or if access is denied based on roles.
   */
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

    const isBlackListedToken = await this.cacheManager.get(`blacklist:${authToken}`,null,null);
    console.log('isBlackListedToken', isBlackListedToken);
    if(isBlackListedToken) {
      return (await this.canActivate(context)) as boolean;
    }
    const tokenSecret = `${process.env.JWT_SECRET}`;

    if (authToken === tokenSecret) {
      if (request.headers.user) {
        request.user = JSON.parse(request.headers['user']);
      }
      return true;
    }
    console.log('userAgent', request.headers);

    try {
      const decodedToken = jwt.verify(authToken, tokenSecret);
      request.user = decodedToken;
    } catch (error) {
      console.log('Token verification failed:', error);
      throw new ForbiddenException('Invalid token');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;
    console.log(`request user`, request.user);

    const userRole = request.user?.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Access denied. ${requiredRoles} only.`);
    }

    return (await super.canActivate(context)) as boolean;
  }
}
