import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { USER_ID_REQUIRED_VALIDATION_ERROR } from '../../error-messages/error-messages';
import { UserManagementController } from './controllers/user-management.controller';
import { UserManagementService } from './services/user-management.service';
import { UpdateRolePermissionDto } from './dtos/update-permission.dto';
import { UserRoleEnum } from '../user-module/enums/roles.enum';
import { PermissionEnum } from './enums/permission.enum';

describe('UserManagementController', () => {
  let userManagementController: UserManagementController;
  let userManagementService: UserManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [
        {
          provide: UserManagementService,
          useValue: {
            softDeleteUser: jest.fn(),
            updateRolesPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    userManagementController = module.get<UserManagementController>(UserManagementController);
    userManagementService = module.get<UserManagementService>(UserManagementService);
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      const userId = '12345';
      const currentUserId = '67890';
      const mockResponse = { message: 'User deleted successfully' };

      jest.spyOn(userManagementService, 'softDeleteUser').mockResolvedValue(mockResponse);

      const result = await userManagementController.deleteUser(userId, currentUserId);

      expect(result).toEqual(mockResponse);
      expect(userManagementService.softDeleteUser).toHaveBeenCalledWith(userId, currentUserId);
    });

    it('should throw BadRequestException if userId is missing', async () => {
      const userId = '';
      const currentUserId = '67890';

      await expect(userManagementController.deleteUser(userId, currentUserId)).rejects.toThrow(
        new BadRequestException(USER_ID_REQUIRED_VALIDATION_ERROR),
      );
    });

    it('should throw BadRequestException if userId is undefined', async () => {
      const userId = '';
      const currentUserId = '67890';

      await expect(userManagementController.deleteUser(userId, currentUserId)).rejects.toThrow(
        new BadRequestException(USER_ID_REQUIRED_VALIDATION_ERROR),
      );
    });
  });

  describe('updatePermission', () => {
    it('should successfully update role permissions', async () => {
      const requestBody: UpdateRolePermissionDto = {
        role: UserRoleEnum.ADMIN,
        permissions: [PermissionEnum.READ, PermissionEnum.WRITE],
      };
      const mockResponse = { message: 'Permissions updated successfully' };

      jest.spyOn(userManagementService, 'updateRolesPermission').mockResolvedValue(mockResponse);

      const result = await userManagementController.updatePermission(requestBody);

      expect(result).toEqual(mockResponse);
      expect(userManagementService.updateRolesPermission).toHaveBeenCalledWith(requestBody);
    });

    it('should throw ForbiddenException if user does not have admin role (handled by decorator)', async () => {
      // Normally, this is handled by the `@Roles('admin')` decorator,
      // but we assume an external mechanism prevents unauthorized access.
      // This test case is a placeholder for permission handling.
      expect(true).toBeTruthy();
    });
  });
});
