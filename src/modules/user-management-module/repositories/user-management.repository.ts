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

    /**
     * Soft deletes a user by updating the `isDeleted` field in the user entity to `true`.
     * 
     * This method performs the following steps:
     * 1. It updates the user record in the database by setting the `isDeleted` field to `true`, effectively marking the user as deleted.
     * 2. The user record is not physically deleted from the database, but is instead flagged as deleted (soft delete).
     * 3. The method returns a success message indicating that the user was deleted successfully.
     * 4. If an error occurs during the update operation, it logs the error and rethrows it for further handling.
     * 
     * @param {string} userId - The unique identifier (`userId`) of the user to be soft deleted.
     * @returns {Promise<any>} A promise that resolves to an object containing a success message:
     *          - `message`: A string message indicating that the user was deleted successfully.
     * @throws {Error} If there is an error during the database update operation, the function throws the error.
     * 
     * @example
     * const response = await userService.softDeleteUser('12345');
     * console.log(response);
     * // Output: { message: "User deleted successfully" }
     */
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

    /**
     * Updates the permissions for a specific role.
     * 
     * This method performs the following steps:
     * 1. It receives an object containing a role and the list of permissions to be updated.
     * 2. The method checks whether the provided role exists in the database by querying the `rolesRepository` for the role.
     * 3. If the role does not exist, it throws a `BadRequestException` with the message "Invalid role passed".
     * 4. If the role exists, it updates the role's permission flags (`canRead`, `canWrite`, `canDelete`) based on the provided permissions.
     * 5. The updated role entity is then saved back to the repository.
     * 6. The function returns a success message indicating that the permissions were updated successfully.
     * 
     * @param {UpdateRolePermissionDto} body - The request body containing the role name and the list of permissions to update for that role.
     * @returns {Promise<any>} A promise that resolves to an object containing a success message:
     *          - `message`: A string message indicating that the permissions for the role were updated successfully.
     * @throws {BadRequestException} If the provided role does not exist in the database, the method throws an exception with the message "Invalid role passed".
     * 
     * @example
     * const response = await rolesService.updateRolePermissions({
     *   role: 'admin',
     *   permissions: [PermissionEnum.READ, PermissionEnum.WRITE]
     * });
     * console.log(response);
     * // Output: { message: "Permissions updated successfully" }
     */
    public async updateRolePermissions(body: UpdateRolePermissionDto): Promise<any> {
        const { role, permissions } = body;

        const roleEntity = await this.rolesRepository.findOne({ where: { roleName: role } });
        if (!roleEntity) {
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