import {
    createParamDecorator,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { UserToken } from '../types/user.type';
  
  /**
 * Custom parameter decorator to retrieve the authenticated user from the request context.
 * 
 * @param {string | undefined} data - Optional property key to extract from the user object.
 * @param {ExecutionContext} context - NestJS execution context containing the request object.
 * 
 * @returns {UserToken | any | null} 
 * - The full user object if no data parameter is provided
 * - The value of the specified user property if data parameter is provided
 * - null if no user is found in request context
 * 
 * @throws {ForbiddenException} 
 * Throws error if user object is explicitly null (invalid authentication state)
 * 
 * @example
 * // Get full user object
 * @Get()
 * getProfile(@GetCurrentUser() user: UserToken) {}
 * 
 * @example
 * // Get specific user property
 * @Get()
 * getEmail(@GetCurrentUser('email') email: string) {}
 * 
 * @remarks
 * - Looks for user in both request.user (JWT strategy) and request.headers.user (fallback)
 * - Adds request headers to user object as 'token' property for debugging purposes
 */
  export const GetCurrentUser = createParamDecorator(
    (data: string | undefined, context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      
      const user: UserToken = request.user || request.headers.user;
      console.log('user', user);
      if (user === null) {
        throw new ForbiddenException('Not found');
      }
      if (!user) return null;
      if (!data) return user;
      user['token'] = request.headers;
      return user[data];
    },
  );
  