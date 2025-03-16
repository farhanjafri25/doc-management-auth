import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UNAUTHORIZED_MESSAGE } from "src/error-messages/error-messages";

@Injectable()
export class Utility {
    constructor() {}

    public validateSignupBody(body: any): boolean {
        if(!body.email || !body.password || !body.role) {
            return false;
        }
        return true;
    }

    public isValidUserBodyForSignUp(body: any): boolean {
        const validUserKeys = ['role', 'email', 'password'];
        const isValidUserObj = Object.keys(body).every((key) =>
          validUserKeys.includes(key),
        );
        if (!isValidUserObj) {
          return false;
        }
        return true;
    }

    public isValidBodyForLogin(body: any): boolean {
        const validUserKeys = ['email', 'password'];
        const isValidUserObj = Object.keys(body).every((key) =>
          validUserKeys.includes(key),
        );
        if (!isValidUserObj) {
          return false;
        }
        return true;
    }

    public validateUserObject(user: any) {
      if(user.isDeleted) throw new UnauthorizedException(UNAUTHORIZED_MESSAGE);
    }
}