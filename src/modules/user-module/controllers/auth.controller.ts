import { BadRequestException, Body, Controller, Get, Post, Req, UseInterceptors } from "@nestjs/common";
import { UserAuthService } from "../services/user.service";
import { UserSignUpDto } from "../dtos/user-signup.dto";
import { UserInterface } from "../interface/user-signup.interface";
import { Utility } from "src/modules/utils/utility";
import { Public } from "src/decorators";
import { UserLoginDto } from "../dtos/user-login.dto";
import { AppInterceptor } from "src/app.interceptor";
import { ALL_FILEDS_REQUIRED_MESSAGE, INVALID_USER_BODY_MESSAGE } from "src/error-messages/error-messages";

@UseInterceptors(AppInterceptor)
@Controller("/user/auth")
export class UserAuthController {
    constructor(
        private readonly userAuthService: UserAuthService,
        private readonly utility: Utility
    ) { }

    /**
     * Handles user sign-up requests by validating the incoming user data, 
     * and if valid, saving the new user to the database.
     * 
     * This method performs the following steps:
     * 1. Validates that all required fields are present in the request body.
     * 2. Checks if the user body conforms to the expected structure for sign-up.
     * 3. Calls the `userAuthService.saveNewUser()` method to persist the new user in the database.
     * 4. If any validation fails, it throws a `BadRequestException` with an appropriate error message.
     * 
     * The function uses the `@Public()` decorator to allow public access to this route (i.e., no authentication required for sign-up).
     * 
     * @param {UserSignUpDto} body - The user sign-up data, which includes fields like email, password, and role.
     * @returns {Promise<UserInterface>} A promise that resolves to a `UserInterface` object representing the newly created user. 
     *          The `UserInterface` includes the user's `userId`, `email`, `role`, and an `accessToken`.
     * @throws {BadRequestException} If the request body is missing required fields or doesn't match the expected structure, 
     *         a `BadRequestException` is thrown with a specific error message.
     *
     * @example
     * const newUser = await authController.userSignUp({
     *   email: 'user@example.com',
     *   password: 'securepassword',
     *   role: 'user'
     * });
     * console.log('New user created:', newUser);
     */
    @Public()
    @Post('/signup')
    public async userSignUp(@Body() body: UserSignUpDto): Promise<UserInterface> {
        if (!this.utility.validateSignupBody(body)) {
            throw new BadRequestException(ALL_FILEDS_REQUIRED_MESSAGE);
        }
        if (!this.utility.isValidUserBodyForSignUp(body)) {
            throw new BadRequestException(INVALID_USER_BODY_MESSAGE);
        }
        const res = await this.userAuthService.saveNewUser(body);
        return res;
    }

    /**
     * Handles the user login process by validating the request body and authenticating the user.
     * 
     * This method performs the following steps:
     * 1. Validates the incoming request body to ensure it meets the expected structure for login (using `isValidBodyForLogin`).
     * 2. If validation passes, it calls the `userAuthService.loginUser()` method to authenticate the user.
     * 3. If authentication is successful, it returns a success response with a status code, message, and the authenticated user data.
     * 4. If validation fails, it throws a `BadRequestException` with a generic error message.
     * 
     * The function uses the `@Public()` decorator, indicating that the login route is accessible publicly without requiring authentication.
     * 
     * @param {UserLoginDto} body - The user login data, including the `email` and `password` of the user.
     * @returns {Promise<any>} A promise that resolves to an object containing the status code, message, and the authenticated user data.
     *          The user data is returned in the `data` property, which includes fields such as `userId`, `email`, `role`, and `accessToken`.
     * @throws {BadRequestException} If the request body does not meet the expected format (e.g., missing fields or invalid data), 
     *         a `BadRequestException` is thrown with the message "Invalid Request".
     *
     * @example
     * const response = await authController.userLogin({
     *   email: 'user@example.com',
     *   password: 'securepassword'
     * });
     * console.log(response);
     * // Output: { code: 200, message: "User Logged In", data: { userId: '123', email: 'user@example.com', role: 'user', accessToken: 'jwt-token' } }
     */
    @Public()
    @Post('/login')
    public async userLogin(@Body() body: UserLoginDto): Promise<any> {
        if (!this.utility.isValidBodyForLogin(body)) {
            throw new BadRequestException("Invalid Request");
        }
        const res = await this.userAuthService.loginUser(body);
        return {
            code: 200,
            message: "User Logged In",
            data: res
        };
    }

    /**
     * Handles the user logout process by invalidating the user's JWT token.
     * 
     * This method performs the following steps:
     * 1. Extracts the JWT token from the `Authorization` header of the incoming request.
     * 2. Passes the token to the `userAuthService.handleLogout()` method to blacklist the token, effectively logging the user out.
     * 3. Returns a success response with a status code, a message, and a confirmation that the user has been logged out.
     * 4. If the `Authorization` header is missing or invalid, this method may throw an error, and proper error handling should be added elsewhere.
     * 
     * The function does not require user credentials or data in the body since the JWT token is expected to be included in the `Authorization` header.
     * 
     * @param {Request} req - The incoming HTTP request, which contains the `Authorization` header with the JWT token.
     * @returns {Promise<any>} A promise that resolves to a response object containing:
     *          - `code`: The HTTP status code (200 for success).
     *          - `message`: A success message indicating that the user has logged out.
     * @throws {Error} If the `Authorization` header is missing or the token is invalid, an error will be thrown.
     *
     * @example
     * const response = await authController.logoutUser(request);
     * console.log(response);
     * // Output: { code: 200, message: "User Logged Out" }
     */
    @Post('/logout')
    public async logoutUser(@Req() req: Request) {
        const res = await this.userAuthService.handleLogout(req.headers['authorization'].split(' ')[1]);
        return {
            code: 200,
            message: "User Logged Out"
        }
    }

}
