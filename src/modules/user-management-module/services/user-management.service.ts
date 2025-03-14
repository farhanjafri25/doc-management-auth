import { BadRequestException, Injectable } from "@nestjs/common";
import { UserManagementRepository } from "../repositories/user-management.repository";
import { UpdateRolePermissionDto } from "../dtos/update-permission.dto";

@Injectable()
export class UserManagementService {
    constructor(
        private readonly userManagementRepo: UserManagementRepository,
    ) {}

    public async softDeleteUser(userId: string, currentUserId: string) {
        if(userId === currentUserId) {
            throw new BadRequestException('You cannot delete yourself')
        }
        return this.userManagementRepo.softDeleteUser(userId);
    }

    public async updateRolesPermission(body: UpdateRolePermissionDto): Promise<any> {
        return this.userManagementRepo.updateRolePermissions(body);
    }

}
