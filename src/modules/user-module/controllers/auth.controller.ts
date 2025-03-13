import { BadRequestException, Body, Controller, Get, Post, Req, UseInterceptors } from "@nestjs/common";
import { UserAuthService } from "../services/user.service";
import { UserSignUpDto } from "../dtos/user-signup.dto";
import { UserInterface } from "../interface/user-signup.interface";
import { Utility } from "src/modules/utils/utility";
import { Public } from "src/decorators";
import { UserLoginDto } from "../dtos/user-login.dto";
import { AppInterceptor } from "src/app.interceptor";

@UseInterceptors(AppInterceptor)
@Controller("/user/auth")
export class UserAuthController {
    constructor(
        private readonly userAuthService: UserAuthService,
        private readonly utility: Utility
    ) {}

    @Public()
    @Post('/signup')
    public async userSignUp(@Body() body: UserSignUpDto): Promise<UserInterface> {
        if(!this.utility.validateSignupBody(body)) {
            throw new BadRequestException("All Fields are required");
        }
        if(!this.utility.isValidUserBodyForSignUp(body)) {
            throw new BadRequestException("Invalid User Body");
        }
        const res = await this.userAuthService.saveNewUser(body);
        return res;
    }

    @Public()
    @Post('/login')
    public async userLogin(@Body() body: UserLoginDto): Promise<any> {
        if(!this.utility.isValidBodyForLogin(body)) {
            throw new BadRequestException("Invalid Request");
        }
        const res = await this.userAuthService.loginUser(body);
        return {
            code: 200,
            message: "User Logged In",
            data: res
        };
    }

    @Post('/logout')
    public async logoutUser(@Req() req: Request) {
        const res = await this.userAuthService.handleLogout(req.headers['authorization'].split(' ')[1]);
        return {
            code: 200,
            message: "User Logged Out"
        }
    }
    
}
