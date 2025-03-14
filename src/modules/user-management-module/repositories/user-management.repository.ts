import { BadRequestException, Injectable } from "@nestjs/common";
import { UserEntity } from "src/modules/user-module/entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { UserRolesEntity } from "../entities/user-roles.entity";
import { UpdateRolePermissionDto } from "../dtos/update-permission.dto";
import { PermissionEnum } from "../enums/permission.enum";

@Injectable()
export class UserManagementRepository {
    private userRepository: Repository<UserEntity>
    private rolesRepository: Repository<UserRolesEntity>
    constructor(private db: DataSource) {
        this.userRepository = this.db.getRepository(UserEntity),
        this.rolesRepository = this.db.getRepository(UserRolesEntity)
    }

    public async softDeleteUser(userId: string): Promise<any> {
        try {
            const res = await this.userRepository.update({
                userId
            }, {
                isDeleted: true
            });
            console.log(`response from delete user`, res);
            
            return {
                message: "User deleted successfully"
            }
        } catch (error) {
            console.log(`error in softDeleteUser`, error);
            throw error;
        }
    }

    public async updateRolePermissions(body: UpdateRolePermissionDto): Promise<any> {
        const { role, permissions } = body;

        const roleEntity = await this.rolesRepository.findOne({where: { roleName: role }});
        if(!roleEntity) {
            throw new BadRequestException("Invald role passed");
        }

        roleEntity.canRead = permissions.includes(PermissionEnum.READ);
        roleEntity.canWrite = permissions.includes(PermissionEnum.WRITE);
        roleEntity.canDelete = permissions.includes(PermissionEnum.DELETE);

        const res = await this.rolesRepository.save(roleEntity);
        console.log(`response from updateRolePermissions`, res);
        return {
            message: "Permissions updated successfully"
        }
    }
}