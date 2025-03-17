import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CANNOT_DELETE_YOURSELF_ERROR } from "../../error-messages/error-messages";
import { UserManagementService } from "./services/user-management.service";
import { UserManagementRepository } from "./repositories/user-management.repository";
import { UpdateRolePermissionDto } from "./dtos/update-permission.dto";
import { PermissionEnum } from "./enums/permission.enum";
import { UserRoleEnum } from "../user-module/enums/roles.enum";

describe("UserManagementService", () => {
  let service: UserManagementService;
  let userManagementRepo: UserManagementRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        {
          provide: UserManagementRepository,
          useValue: {
            softDeleteUser: jest.fn(),
            updateRolePermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    userManagementRepo = module.get<UserManagementRepository>(UserManagementRepository);
  });

  describe("softDeleteUser", () => {
    it("should successfully soft delete a user", async () => {
      const userId = "123";
      const currentUserId = "456";
      const mockResponse = { message: "User deleted successfully" };

      jest.spyOn(userManagementRepo, "softDeleteUser").mockResolvedValue(mockResponse);

      const result = await service.softDeleteUser(userId, currentUserId);

      expect(result).toEqual(mockResponse);
      expect(userManagementRepo.softDeleteUser).toHaveBeenCalledWith(userId);
    });

    it("should throw a BadRequestException if user tries to delete themselves", async () => {
      const userId = "123";
      const currentUserId = "123"; // Same user ID

      await expect(service.softDeleteUser(userId, currentUserId)).rejects.toThrow(
        new BadRequestException(CANNOT_DELETE_YOURSELF_ERROR)
      );

      expect(userManagementRepo.softDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe("updateRolesPermission", () => {
    it("should update role permissions successfully", async () => {
      const updateDto: UpdateRolePermissionDto = {
        role: UserRoleEnum.ADMIN,
        permissions: [PermissionEnum.READ, PermissionEnum.WRITE],
      };
      const mockResponse = { message: "Permissions updated successfully" };

      jest.spyOn(userManagementRepo, "updateRolePermissions").mockResolvedValue(mockResponse);

      const result = await service.updateRolesPermission(updateDto);

      expect(result).toEqual(mockResponse);
      expect(userManagementRepo.updateRolePermissions).toHaveBeenCalledWith(updateDto);
    });
  });
});
