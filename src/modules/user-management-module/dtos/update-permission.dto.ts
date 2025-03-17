import { IsArray, IsEnum, IsNotEmpty } from "class-validator";
import { UserRoleEnum } from "../../../modules/user-module/enums/roles.enum";
import { PermissionEnum } from "../enums/permission.enum";

export class UpdateRolePermissionDto {
    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;

    @IsNotEmpty()
    @IsArray()
    @IsEnum(PermissionEnum, { each: true })
    permissions: PermissionEnum[];
}