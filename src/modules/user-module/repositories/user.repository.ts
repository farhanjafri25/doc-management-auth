import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { UserSignUpInterface } from "../interface/user-signup.interface";
import { UserRoleEnum } from "../enums/roles.enum";

@Injectable()
export class UserAuthRepository {
    private userRepository: Repository<UserEntity>;
    constructor(private db: DataSource) {
        this.userRepository = this.db.getRepository(UserEntity);
    }

    /**
     * Saves a new user to the database after validating and transforming the input data.
     * This method creates a new instance of `UserEntity`, populates it with the provided user data,
     * and then saves it to the database using the `userRepository`. If an error occurs during the process,
     * it logs the error and rethrows it.
     *
     * @param {UserSignUpInterface} user - The data for the user to be created. It contains the user's ID, email, password, and role.
     * @returns {Promise<UserEntity>} A promise that resolves to the saved `UserEntity` object if successful.
     * @throws {Error} If any error occurs during the save operation, it is caught and rethrown.
     * 
     * @example
     * const newUser = await userService.saveNewUser({
     *   userId: '12345',
     *   email: 'user@example.com',
     *   password: 'securepassword',
     *   role: 'admin',
     * });
     * console.log('User saved:', newUser);
     */
    public async saveNewUser(user: UserSignUpInterface): Promise<UserEntity> {
        try {
            const userObj = new UserEntity();
            userObj.userId = user.userId;
            userObj.email = user.email;
            userObj.password = user.password;
            userObj.role = user.role as UserRoleEnum;
            return await this.userRepository.save(userObj);
        } catch (error) {
            console.log(`error in saveNewUser`, error);
            throw error;
        }
    }

    /**
     * Retrieves a user from the database based on the provided email address.
     * This method queries the `userRepository` to find a single `UserEntity` that matches the given email.
     * If the user is found, it returns the user object; otherwise, it returns `null`. 
     * In case of an error during the database query, it logs the error and rethrows it.
     *
     * @param {string} email - The email address of the user to be fetched from the database.
     * @returns {Promise<UserEntity | null>} A promise that resolves to the `UserEntity` object if the user is found, or `null` if no user matches the provided email.
     * @throws {Error} If any error occurs during the database query, it is caught and rethrown.
     *
     * @example
     * const user = await userService.getUserByEmail('user@example.com');
     * if (user) {
     *   console.log('User found:', user);
     * } else {
     *   console.log('User not found');
     * }
     */
    public async getUserByEmail(email: string): Promise<UserEntity | null> {
        try {
            const res = await this.userRepository.findOne({
                where: {
                    email
                }
            });
            console.log(`---- User Obj through email ----`, res);
            return res;
        } catch (error) {
            console.log(`error in getUserByEmail`, error);
            throw error;
        }
    }
}