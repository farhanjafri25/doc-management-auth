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
import { Utility } from "src/modules/utils/utility";
import { INVALID_CREDENTIALS, UNABLE_TO_SAVE_USER_MESSAGE, USER_NOT_FOUND_MESSAGE } from "src/error-messages/error-messages";

@Injectable()
export class UserAuthService {
    constructor(
        private readonly userAuthRepository: UserAuthRepository,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly utility: Utility
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
                throw new Error(UNABLE_TO_SAVE_USER_MESSAGE);
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
            if (!user) {
                throw new BadRequestException(USER_NOT_FOUND_MESSAGE);
            }
            this.utility.validateUserObject(user);
            const comparePassword = await bcrypt.compare(body.password, user.password);
            if(!comparePassword) throw new BadRequestException(INVALID_CREDENTIALS);
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

    public async handleLogout(token: string): Promise<boolean> {
        try {
            console.log(`token`, token);
            const decodedToken = this.jwtService.decode(token) as { exp: number};
            console.log(`decodedToken`, decodedToken);
            const ttl = decodedToken.exp - Math.floor(Date.now() / 1000);
            if(ttl > 0) {
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