import { BadRequestException } from "@nestjs/common";
import { DataSource, Repository, ObjectLiteral } from "typeorm";
import { UserEntity } from "../../modules/user-module/entities/user.entity";
import { UserManagementRepository } from "./repositories/user-management.repository";
import { UserRolesEntity } from "./entities/user-roles.entity";
import { UpdateRolePermissionDto } from "./dtos/update-permission.dto";
import { PermissionEnum } from "./enums/permission.enum";
import { UserRoleEnum } from "../user-module/enums/roles.enum";

describe('UserManagementRepository', () => {
    let repository: UserManagementRepository;
    let userRepository: Repository<UserEntity>;
    let rolesRepository: Repository<UserRolesEntity>;
    let dataSource: DataSource;

    beforeEach(() => {
        dataSource = new DataSource({type: 'postgres', database: ':memory:'} as any);
        userRepository = {
            update: jest.fn(),
        } as any;
        rolesRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        } as any;
        
        jest.spyOn(dataSource, 'getRepository')
            .mockImplementation((entity): Repository<ObjectLiteral> => {
                if (entity === UserEntity) return userRepository as unknown as Repository<ObjectLiteral>;
                if (entity === UserRolesEntity) return rolesRepository as unknown as Repository<ObjectLiteral>;
                return null as unknown as Repository<ObjectLiteral>;
            });

        repository = new UserManagementRepository(dataSource);
    });

    describe('softDeleteUser', () => {
        it('should soft delete a user successfully', async () => {
            const userId = '123';
            (userRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

            const result = await repository.softDeleteUser(userId);

            expect(userRepository.update).toHaveBeenCalledWith({ userId }, { isDeleted: true });
            expect(result).toEqual({ message: "User deleted successfully" });
        });

        it('should throw an error if deletion fails', async () => {
            const userId = '123';
            (userRepository.update as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(repository.softDeleteUser(userId)).rejects.toThrow('Database error');
        });
    });

    describe('updateRolePermissions', () => {
        it('should update role permissions successfully', async () => {
            const role = UserRoleEnum.ADMIN;
            const permissions: PermissionEnum[] = [PermissionEnum.READ, PermissionEnum.WRITE];
            const roleEntity = new UserRolesEntity();
            roleEntity.roleName = role;
            roleEntity.canRead = false;
            roleEntity.canWrite = false;
            roleEntity.canDelete = false;

            (rolesRepository.findOne as jest.Mock).mockResolvedValue(roleEntity);
            (rolesRepository.save as jest.Mock).mockResolvedValue(roleEntity);

            const updateDto: UpdateRolePermissionDto = { role, permissions };
            const result = await repository.updateRolePermissions(updateDto);

            expect(rolesRepository.findOne).toHaveBeenCalledWith({ where: { roleName: role } });
            expect(rolesRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                canRead: true,
                canWrite: true,
                canDelete: false,
            }));
            expect(result).toEqual({ message: "Permissions updated successfully" });
        });

        it('should throw a BadRequestException if role does not exist', async () => {
            const role = UserRoleEnum.VIEWER;
            const permissions: PermissionEnum[] = [PermissionEnum.READ];

            (rolesRepository.findOne as jest.Mock).mockResolvedValue(null);

            const updateDto: UpdateRolePermissionDto = { role, permissions };
            await expect(repository.updateRolePermissions(updateDto))
                .rejects.toThrow(BadRequestException);
        });
    });
});
