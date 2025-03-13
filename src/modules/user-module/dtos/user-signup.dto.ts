import { IsEnum, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";
import { UserRoleEnum } from "../enums/roles.enum";

export class UserSignUpDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @IsStrongPassword()
    password: string;

    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}