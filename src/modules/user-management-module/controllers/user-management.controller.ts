import { BadRequestException, Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { GetCurrentUser, Roles } from "../../../decorators";
import { UserManagementService } from "../services/user-management.service";
import { UpdateRolePermissionDto } from "../dtos/update-permission.dto";
import { AppInterceptor } from "../../../app.interceptor";
import { USER_ID_REQUIRED_VALIDATION_ERROR } from "../../../error-messages/error-messages";

@UseInterceptors(AppInterceptor)
@Controller('/user/management')
export class UserManagementController {
    constructor(
        private userManagementService: UserManagementService,
    ) { }

    /**
     * Soft deletes a user by their `userId`. The operation can only be performed by users with the `admin` role.
     * 
     * This method performs the following steps:
     * 1. It ensures that a valid `userId` is provided in the request body.
     * 2. It checks that the `userId` is not empty or undefined. If the `userId` is invalid, it throws a `BadRequestException` with a validation error.
     * 3. The method then calls the `userManagementService.softDeleteUser` function to perform the soft delete operation.
     * 4. The `softDeleteUser` method is passed both the `userId` (the ID of the user to be deleted) and the `currentUserId` (the ID of the user making the request).
     * 5. The `Roles` decorator ensures that only users with the `admin` role can call this endpoint.
     * 6. If the operation is successful, a response confirming the deletion is returned.
     * 
     * @param {string} userId - The unique identifier of the user to be soft deleted. This value is passed in the request body.
     * @param {string} currentUserId - The unique identifier of the user making the request. This value is retrieved from the `@GetCurrentUser('id')` decorator.
     * @returns {Promise<any>} A promise that resolves to the result of the soft delete operation, typically an object confirming that the user was deleted successfully.
     * @throws {BadRequestException} If the `userId` is not provided or is invalid (empty), a `BadRequestException` is thrown with the message `USER_ID_REQUIRED_VALIDATION_ERROR`.
     * @throws {ForbiddenException} If the user does not have the required `admin` role, the `Roles` decorator will block the request.
     * 
     * @example
     * const response = await userController.deleteUser('12345', '67890');
     * console.log(response);
     * // Output: { message: "User deleted successfully" }
     */
    @Post('/delete-user')
    @Roles('admin')
    public async deleteUser(@Body('userId') userId: string, @GetCurrentUser('id') currentUserId: string): Promise<any> {
        if (!userId || !userId.length) {
            throw new BadRequestException(USER_ID_REQUIRED_VALIDATION_ERROR);
        }
        return await this.userManagementService.softDeleteUser(userId, currentUserId);
    }

    /**
     * Updates the permissions for a specific role. This operation can only be performed by users with the `admin` role.
     * 
     * This method performs the following steps:
     * 1. It receives a request body containing the role name and the permissions to be updated.
     * 2. It calls the `updateRolesPermission` method in the `userManagementService` to update the permissions for the specified role.
     * 3. The `Roles` decorator ensures that only users with the `admin` role are authorized to perform this action.
     * 4. The method returns the result of the permission update operation, typically an object confirming that the permissions were updated successfully.
     * 
     * @param {UpdateRolePermissionDto} body - The request body containing the role name and the list of permissions to update for that role.
     * @returns {Promise<any>} A promise that resolves to the result of the permissions update operation, typically an object confirming that the permissions were updated successfully.
     * @throws {ForbiddenException} If the user does not have the required `admin` role, the `Roles` decorator will block the request and throw a `ForbiddenException`.
     * 
     * @example
     * const response = await userController.updatePermission({
     *   role: 'admin',
     *   permissions: [PermissionEnum.READ, PermissionEnum.WRITE]
     * });
     * console.log(response);
     * // Output: { message: "Permissions updated successfully" }
     */
    @Post('/update-permission')
    @Roles('admin')
    public async updatePermission(@Body() body: UpdateRolePermissionDto) {
        return await this.userManagementService.updateRolesPermission(body);
    }
}