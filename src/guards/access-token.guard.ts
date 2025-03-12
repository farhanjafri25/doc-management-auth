import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import * as path from 'path';
import * as dotenv from 'dotenv';

const envPath = path.join(
  process.cwd(),
  process.env.NODE_ENV ? `envs/.env.${process.env.NODE_ENV}` : `/.env`,
);
dotenv.config({
  path: envPath,
});

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    const authorization = String(request.headers['authorization']);
    if (!authorization || authorization === null)
      return super.canActivate(context);
    const authToken = authorization.split(' ')[1];
    const tokenSecret = `${process.env.JWT_SECRET}`;
    console.log('authorization', authToken, tokenSecret);
    if (authToken === tokenSecret) {
      if (request.headers.user) {
        request.user = JSON.parse(request.headers['user']);
      }
      return true;
    }
    console.log('userAgent', request.headers['user-agent']);
    return super.canActivate(context);
  }
}
