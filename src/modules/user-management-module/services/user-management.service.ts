import { BadRequestException, Injectable } from "@nestjs/common";
import { UserManagementRepository } from "../repositories/user-management.repository";
import { UpdateRolePermissionDto } from "../dtos/update-permission.dto";
import { CANNOT_DELETE_YOURSELF_ERROR } from "../../../error-messages/error-messages";

@Injectable()
export class UserManagementService {
    constructor(
        private readonly userManagementRepo: UserManagementRepository,
    ) { }

    /**
     * Soft deletes a user by their `userId`, ensuring that the current user cannot delete themselves.
     * 
     * This method performs the following steps:
     * 1. It first checks if the `userId` to be deleted is the same as the `currentUserId` (the ID of the user making the request).
     * 2. If the `userId` and `currentUserId` are the same, it throws a `BadRequestException` with a message that the user cannot delete themselves.
     * 3. If the `userId` is different from the `currentUserId`, the method proceeds to call the repository method `softDeleteUser` to mark the user as deleted (soft delete).
     * 4. The method returns the result of the soft delete operation performed by the repository.
     * 
     * @param {string} userId - The unique identifier (`userId`) of the user to be soft deleted.
     * @param {string} currentUserId - The unique identifier (`currentUserId`) of the user making the request, ensuring they are not deleting themselves.
     * @returns {Promise<any>} A promise that resolves to the result of the soft delete operation, typically an object confirming that the user has been successfully soft-deleted.
     * @throws {BadRequestException} If the `userId` to be deleted is the same as the `currentUserId`, it throws a `BadRequestException` with the message `CANNOT_DELETE_YOURSELF_ERROR`.
     * 
     * @example
     * const response = await userService.softDeleteUser('12345', '67890');
     * console.log(response);
     * // Output: { message: "User deleted successfully" }
     */
    public async softDeleteUser(userId: string, currentUserId: string) {
        if (userId === currentUserId) {
            throw new BadRequestException(CANNOT_DELETE_YOURSELF_ERROR)
        }
        return this.userManagementRepo.softDeleteUser(userId);
    }

    /**
     * Updates the permissions for a role based on the provided data.
     * 
     * This method delegates the task of updating role permissions to the `userManagementRepo.updateRolePermissions` method, passing the provided data.
     * It acts as a wrapper around the repository method to handle role permission updates in the system.
     * 
     * @param {UpdateRolePermissionDto} body - The request body containing the role name and a list of permissions to update for that role.
     * @returns {Promise<any>} A promise that resolves to the result of the role permissions update operation, typically an object confirming that the permissions were updated successfully.
     * @throws {Error} If an error occurs in the repository method, it will be propagated and handled by higher-level error handling mechanisms.
     * 
     * @example
     * const response = await userService.updateRolesPermission({
     *   role: 'admin',
     *   permissions: [PermissionEnum.READ, PermissionEnum.WRITE]
     * });
     * console.log(response);
     * // Output: { message: "Permissions updated successfully" }
     */
    public async updateRolesPermission(body: UpdateRolePermissionDto): Promise<any> {
        return this.userManagementRepo.updateRolePermissions(body);
    }

}
