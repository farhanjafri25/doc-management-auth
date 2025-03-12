import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserAuthRepository {
    private userRepository: Repository<UserEntity>;
    constructor(private db: DataSource) {
        this.userRepository = this.db.getRepository(UserEntity);
    }
}