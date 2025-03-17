import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UNAUTHORIZED_MESSAGE } from "../../error-messages/error-messages";

@Injectable()
export class Utility {
  constructor() { }

  /**
   * Validates the required fields in the signup request body.
   * 
   * This method checks if the `email`, `password`, and `role` properties are present in the provided `body` object.
   * If any of these properties are missing, it returns `false`, indicating that the signup body is invalid.
   * Otherwise, it returns `true`, indicating that the signup body contains all the necessary fields.
   * 
   * @param {any} body The request body containing the signup information.
   * 
   * @returns {boolean} `true` if all required fields (`email`, `password`, `role`) are present, otherwise `false`.
   * 
   * @throws {Error} This method does not throw any exceptions, but it will return `false` if any required field is missing.
   * 
   * @example
   * // Example of calling the method:
   * const isValid = validateSignupBody({ email: 'user@example.com', password: 'password123', role: 'user' });
   * console.log(isValid); // Output: true
   * 
   * const isValidInvalid = validateSignupBody({ email: 'user@example.com', password: 'password123' });
   * console.log(isValidInvalid); // Output: false
   */
  public validateSignupBody(body: any): boolean {
    if (!body.email || !body.password || !body.role) {
      return false;
    }
    return true;
  }

  /**
   * Validates that the signup request body contains only the allowed user fields (`role`, `email`, `password`).
   * 
   * This method checks that the provided `body` object contains only the valid keys: `role`, `email`, and `password`. 
   * If any other keys are present in the `body`, the method returns `false`, indicating the body contains invalid fields.
   * If the body contains only the allowed keys, the method returns `true`, indicating that the body is valid.
   * 
   * @param {any} body The request body containing the user signup data.
   * 
   * @returns {boolean} `true` if the body contains only the valid keys (`role`, `email`, `password`), otherwise `false`.
   * 
   * @throws {Error} This method does not throw any exceptions, but it will return `false` if invalid fields are present.
   * 
   * @example
   * // Example of calling the method with a valid body:
   * const isValid = isValidUserBodyForSignUp({ email: 'user@example.com', password: 'password123', role: 'user' });
   * console.log(isValid); // Output: true
   * 
   * // Example of calling the method with an invalid body:
   * const isValidInvalid = isValidUserBodyForSignUp({ email: 'user@example.com', password: 'password123', role: 'user', extraField: 'value' });
   * console.log(isValidInvalid); // Output: false
   */
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

  /**
   * Validates that the login request body contains only the allowed user fields (`email`, `password`).
   * 
   * This method checks that the provided `body` object contains only the valid keys: `email` and `password`. 
   * If any other keys are present in the `body`, the method returns `false`, indicating the body contains invalid fields.
   * If the body contains only the allowed keys, the method returns `true`, indicating that the body is valid.
   * 
   * @param {any} body The request body containing the user login data.
   * 
   * @returns {boolean} `true` if the body contains only the valid keys (`email`, `password`), otherwise `false`.
   * 
   * @throws {Error} This method does not throw any exceptions, but it will return `false` if invalid fields are present.
   * 
   * @example
   * // Example of calling the method with a valid body:
   * const isValid = isValidBodyForLogin({ email: 'user@example.com', password: 'password123' });
   * console.log(isValid); // Output: true
   * 
   * // Example of calling the method with an invalid body:
   * const isValidInvalid = isValidBodyForLogin({ email: 'user@example.com', password: 'password123', extraField: 'value' });
   * console.log(isValidInvalid); // Output: false
   */
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

  /**
   * Validates the provided user object to check if the user is marked as deleted.
   * 
   * This method checks whether the provided user object has an `isDeleted` property set to `true`. 
   * If the `isDeleted` property is `true`, it throws an `UnauthorizedException`, indicating that the user is unauthorized to perform actions.
   * 
   * @param {any} user The user object that needs to be validated.
   * 
   * @throws {UnauthorizedException} If the user is marked as deleted (`isDeleted: true`), an `UnauthorizedException` is thrown with an appropriate error message.
   * 
   * @example
   * // Example of calling the method with a valid user object:
   * try {
   *     validateUserObject({ isDeleted: false });
   *     console.log('User is valid');
   * } catch (error) {
   *     console.log(error.message); // Will not be reached if the user is valid
   * }
   *
   * // Example of calling the method with a user marked as deleted:
   * try {
   *     validateUserObject({ isDeleted: true });
   * } catch (error) {
   *     console.log(error.message); // Output: "Unauthorized access"
   * }
   */
  public validateUserObject(user: any) {
    if (user.isDeleted) throw new UnauthorizedException(UNAUTHORIZED_MESSAGE);
  }
}