import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { UserAuthRepository } from "../repositories/user.repository";
import { UserSignUpDto } from "../dtos/user-signup.dto";
import { UserInterface } from "../interface/user-signup.interface";
import { genSalt, hash } from "bcryptjs";
import { uuid as uuidv4 } from 'uuidv4'
import { JwtService } from "@nestjs/jwt";
import { JWT_EXPIRE } from "../../../constants";
import { UserLoginDto } from "../dtos/user-login.dto";
import * as bcrypt from 'bcryptjs';
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Utility } from "../../../modules/utils/utility";
import { INVALID_CREDENTIALS, UNABLE_TO_SAVE_USER_MESSAGE, USER_NOT_FOUND_MESSAGE } from "../../../error-messages/error-messages";

@Injectable()
export class UserAuthService {
    constructor(
        private readonly userAuthRepository: UserAuthRepository,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly utility: Utility
    ) { }

    /**
 * Saves a new user to the database by hashing their password, generating a unique user ID, 
 * and creating an access token for authentication. This method:
 * - Hashes the user's password using bcrypt before saving.
 * - Generates a unique `userId` for the new user using `uuidv4`.
 * - Calls the `userAuthRepository.saveNewUser` method to store the user's details in the database.
 * - If the user is saved successfully, it creates a JWT (JSON Web Token) access token with an expiration time.
 * - If the user cannot be saved, an error is thrown.
 *
 * @param {UserSignUpDto} body - The user sign-up data containing the email, password, and role.
 * @returns {Promise<UserInterface>} A promise that resolves to the `UserInterface` object, 
 * which includes the user's `userId`, `email`, `role`, and the generated `accessToken`.
 * @throws {Error} If any error occurs during the process (e.g., user saving failure, token generation failure), 
 * it is caught and rethrown.
 *
 * @example
 * const newUser = await userService.saveNewUser({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   role: 'user',
 * });
 * console.log('New user created:', newUser);
 */
    public async saveNewUser(body: UserSignUpDto): Promise<UserInterface> {
        try {
            const salt = await genSalt(10);
            const passwordHash = await hash(body.password, salt);
            const userId = uuidv4();
            const res = await this.userAuthRepository.saveNewUser({
                userId: userId,
                password: passwordHash,
                email: body.email,
                role: body.role
            })
            if (!res) {
                throw new Error(UNABLE_TO_SAVE_USER_MESSAGE);
            }
            const jwtPayload = {
                id: userId,
                email: body.email,
                role: body.role
            }
            const accesssToken = this.jwtService.sign(jwtPayload, { expiresIn: JWT_EXPIRE });
            return {
                userId,
                email: body.email,
                role: body.role,
                accessToken: accesssToken
            }
        } catch (error) {
            console.log(`error in saveNewUser`, error);
            throw error;
        }
    }

    /**
 * Authenticates a user by verifying their email and password.
 * This method:
 * - Retrieves the user from the database based on the provided email.
 * - Validates the user object (checks if it exists and meets the required conditions).
 * - Compares the provided password with the hashed password stored in the database using bcrypt.
 * - If the credentials are valid, generates a JWT access token that expires after a defined duration.
 * - If the user is not found or the password is incorrect, throws a `BadRequestException`.
 *
 * @param {UserLoginDto} body - The user login data, which includes the email and password.
 * @returns {Promise<UserInterface>} A promise that resolves to an object containing the user's `userId`, `email`, `role`, and the generated `accessToken`.
 * @throws {BadRequestException} If the user is not found or the password does not match, a `BadRequestException` is thrown with an appropriate message.
 *
 * @example
 * const user = await authService.loginUser({
 *   email: 'user@example.com',
 *   password: 'userpassword',
 * });
 * console.log('Logged in user:', user);
 */
    public async loginUser(body: UserLoginDto): Promise<UserInterface> {
        try {
            const user = await this.userAuthRepository.getUserByEmail(body.email);
            if (!user) {
                throw new BadRequestException(USER_NOT_FOUND_MESSAGE);
            }
            this.utility.validateUserObject(user);
            const comparePassword = await bcrypt.compare(body.password, user.password);
            if (!comparePassword) throw new BadRequestException(INVALID_CREDENTIALS);
            const accessToken = await this.jwtService.sign({
                id: user.userId,
                email: user.email,
                role: user.role
            }, { expiresIn: JWT_EXPIRE });

            return {
                userId: user.userId,
                email: user.email,
                role: user.role,
                accessToken
            }
        } catch (error) {
            console.log(`error in loginUser`, error);
            throw error;
        }
    }

    /**
 * Handles the user logout by blacklisting the provided JWT token.
 * This method decodes the provided JWT token, calculates its TTL (Time To Live), and stores it in the cache with the remaining TTL. 
 * By doing so, the token is effectively invalidated, ensuring that it cannot be used for further authentication.
 * 
 * The function follows these steps:
 * 1. Decodes the provided JWT token to extract its expiration time.
 * 2. Calculates the time-to-live (TTL) of the token by subtracting the current time from the token's expiration time.
 * 3. If the token is still valid (TTL > 0), it stores the token in the cache with the remaining TTL to mark it as blacklisted.
 * 4. Optionally, logs the result of the cache set operation and the TTL value.
 * 
 * @param {string} token - The JWT token to be blacklisted (string).
 * @returns {Promise<boolean>} A promise that resolves to `true` if the token was successfully blacklisted, or `false` if it was not. 
 * If the token's TTL is not valid, the function does not perform any cache operation.
 * @throws {Error} If any error occurs while decoding the token, calculating the TTL, or interacting with the cache, the error is caught and rethrown.
 *
 * @example
 * const isLoggedOut = await authService.handleLogout('jwtTokenHere');
 * console.log('Logout successful:', isLoggedOut);
 */
    public async handleLogout(token: string): Promise<boolean> {
        try {
            console.log(`token`, token);
            const decodedToken = this.jwtService.decode(token) as { exp: number };
            console.log(`decodedToken`, decodedToken);
            const ttl = decodedToken.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
                const res = await this.cacheManager.set(`blacklist:${token}`, true, ttl * 1000);
                console.log(`res in setting cache`, res);
                const ttlVal = await this.cacheManager.ttl(`blacklist:${token}`);
                console.log(`ttl in setting cache`, ttlVal);
            }
            return true;
        } catch (error) {
            console.log(`error in handleLogout`, error);
            throw error;
        }
    }

    //revisit logic
    public async getTTL(token: string) {
        const res = await this.cacheManager.get(`blacklist:${token}`);
        console.log(`res`, res);

        return res;
    }
}