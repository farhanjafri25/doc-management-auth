import { DataSource, Repository } from 'typeorm';
import { UserRoleEnum } from './enums/roles.enum';
import { UserAuthRepository } from './repositories/user.repository';
import { UserSignUpInterface } from './interface/user-signup.interface';
import { UserEntity } from './entities/user.entity';

jest.mock('typeorm', () => {
    const actualTypeorm = jest.requireActual('typeorm');
    return {
        ...actualTypeorm,
        DataSource: jest.fn().mockImplementation(() => ({
            getRepository: jest.fn()
        })),
    };
});

describe('UserAuthRepository', () => {
    let userAuthRepository: UserAuthRepository;
    let mockUserRepository: Repository<UserEntity>;

    beforeEach(() => {
        const mockDb = new DataSource({ type: 'postgres', database: ':memory:' });
        mockUserRepository = {
            save: jest.fn(),
            findOne: jest.fn(),
        } as unknown as Repository<UserEntity>;
        mockDb.getRepository = jest.fn().mockReturnValue(mockUserRepository);
        userAuthRepository = new UserAuthRepository(mockDb);
    });

    describe('saveNewUser', () => {
        it('should save a new user successfully', async () => {
            const user: UserSignUpInterface = {
                userId: '123',
                email: 'test@example.com',
                password: 'password123',
                role: UserRoleEnum.ADMIN,
            };
            const savedUser = { ...user } as UserEntity;
            (mockUserRepository.save as jest.Mock).mockResolvedValue(savedUser);

            const result = await userAuthRepository.saveNewUser(user);

            expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
            expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining(user));
            expect(result).toEqual(savedUser);
        });

        it('should throw an error if save fails', async () => {
            const user: UserSignUpInterface = {
                userId: '123',
                email: 'test@example.com',
                password: 'password123',
                role: UserRoleEnum.ADMIN,
            };
            (mockUserRepository.save as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(userAuthRepository.saveNewUser(user)).rejects.toThrow('Database error');
            expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('getUserByEmail', () => {
        it('should return a user when found', async () => {
            const user: UserEntity = {
                userId: '123',
                email: 'test@example.com',
                password: 'password123',
                role: UserRoleEnum.ADMIN,
            } as UserEntity;
            (mockUserRepository.findOne as jest.Mock).mockResolvedValue(user);

            const result = await userAuthRepository.getUserByEmail('test@example.com');

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(result).toEqual(user);
        });

        it('should return null if user is not found', async () => {
            (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

            const result = await userAuthRepository.getUserByEmail('notfound@example.com');

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });

        it('should throw an error if findOne fails', async () => {
            (mockUserRepository.findOne as jest.Mock).mockRejectedValue(new Error('Database query error'));

            await expect(userAuthRepository.getUserByEmail('test@example.com')).rejects.toThrow('Database query error');
            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
        });
    });
});
