import { BadRequestException, Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { GetCurrentUser, Roles } from "src/decorators";
import { UserManagementService } from "../services/user-management.service";
import { UpdateRolePermissionDto } from "../dtos/update-permission.dto";
import { AppInterceptor } from "src/app.interceptor";
import { USER_ID_REQUIRED_VALIDATION_ERROR } from "src/error-messages/error-messages";

@UseInterceptors(AppInterceptor)
@Controller('/user/management')
export class UserManagementController {
    constructor(
        private userManagementService: UserManagementService,
    ) {}

    @Post('/delete-user')
    @Roles('admin')
    public async deleteUser(@Body('userId') userId: string, @GetCurrentUser('id') currentUserId: string): Promise<any> {
        if(!userId || !userId.length) {
            throw new BadRequestException(USER_ID_REQUIRED_VALIDATION_ERROR);
        }
        return await this.userManagementService.softDeleteUser(userId, currentUserId);
    }

    @Post('/update-permission')
    @Roles('admin')
    public async updatePermission(@Body() body: UpdateRolePermissionDto) {
        return await this.userManagementService.updateRolesPermission(body);
    }
}