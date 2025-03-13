import { BadRequestException, Injectable } from "@nestjs/common";
import { UserAuthRepository } from "../repositories/user.repository";
import { UserSignUpDto } from "../dtos/user-signup.dto";
import { UserInterface } from "../interface/user-signup.interface";
import { genSalt, hash } from "bcryptjs";
import { uuid as uuidv4 } from 'uuidv4'
import { JwtService } from "@nestjs/jwt";
import { JWT_EXPIRE } from "../../../constants";
import { UserLoginDto } from "../dtos/user-login.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserAuthService {
    constructor(
        private readonly userAuthRepository: UserAuthRepository,
        private readonly jwtService: JwtService
    ) {}

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
            if(!res) {
                throw new Error("Unable to save user");
            }
            const jwtPayload = {
                id: userId,
                email: body.email,
                role: body.role
            }
            const accesssToken = this.jwtService.sign(jwtPayload, {expiresIn: JWT_EXPIRE});
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

    public async loginUser(body: UserLoginDto): Promise<UserInterface> {
        try {
            const user = await this.userAuthRepository.getUserByEmail(body.email);
            if(!user) throw new BadRequestException("User not found");
            const comparePassword = await bcrypt.compare(body.password, user.password);
            if(!comparePassword) throw new BadRequestException("Invalid credentials");
            const accessToken = await this.jwtService.sign({
                id: user.userId,
                email: user.email,
                role: user.role
            }, {expiresIn: JWT_EXPIRE});

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
}