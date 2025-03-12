import { Injectable } from "@nestjs/common";
import { UserAuthRepository } from "../repositories/user.repository";

@Injectable()
export class UserAuthService {
    constructor(
        private readonly userAuthRepository: UserAuthRepository
    ) {}
}