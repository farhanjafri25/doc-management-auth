import { BadRequestException, Injectable } from "@nestjs/common";
import { UserManagementRepository } from "../repositories/user-management.repository";
import { UpdateRolePermissionDto } from "../dtos/update-permission.dto";
import { CANNOT_DELETE_YOURSELF_ERROR } from "src/error-messages/error-messages";

@Injectable()
export class UserManagementService {
    constructor(
        private readonly userManagementRepo: UserManagementRepository,
    ) {}

    public async softDeleteUser(userId: string, currentUserId: string) {
        if(userId === currentUserId) {
            throw new BadRequestException(CANNOT_DELETE_YOURSELF_ERROR)
        }
        return this.userManagementRepo.softDeleteUser(userId);
    }

    public async updateRolesPermission(body: UpdateRolePermissionDto): Promise<any> {
        return this.userManagementRepo.updateRolePermissions(body);
    }

}
