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