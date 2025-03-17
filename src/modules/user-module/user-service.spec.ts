import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserAuthService } from './services/user.service';
import { UserAuthRepository } from './repositories/user.repository';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRoleEnum } from './enums/roles.enum';
import { Utility } from '../utils/utility';
import { UNABLE_TO_SAVE_USER_MESSAGE, USER_NOT_FOUND_MESSAGE } from '../../error-messages/error-messages';
import * as uuid from 'uuidv4';


describe('UserAuthService', () => {
    let service: UserAuthService;
    let userAuthRepository: UserAuthRepository;
    let jwtService: JwtService;
    let cacheManager;
    let utility: Utility;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserAuthService,
                {
                    provide: UserAuthRepository,
                    useValue: {
                        saveNewUser: jest.fn(),
                        getUserByEmail: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        decode: jest.fn()
                    }
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        set: jest.fn(),
                        get: jest.fn(),
                        ttl: jest.fn()
                    }
                },
                {
                    provide: Utility,
                    useValue: {
                        validateUserObject: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<UserAuthService>(UserAuthService);
        userAuthRepository = module.get<UserAuthRepository>(UserAuthRepository);
        jwtService = module.get<JwtService>(JwtService);
        cacheManager = module.get(CACHE_MANAGER);
        utility = module.get<Utility>(Utility);
    });

    describe('saveNewUser', () => {
        it('should save a new user and return user details with accessToken', async () => {
            const dto: UserSignUpDto = { email: 'test@example.com', password: 'password123', role: UserRoleEnum.ADMIN };
        
            // Mock UUID to return a fixed value
            jest.spyOn(uuid, 'uuid').mockReturnValue('123');
        
            jest.spyOn(userAuthRepository, 'saveNewUser').mockResolvedValue({
                userId: '123',
                email: dto.email,
                password: dto.password,
                role: dto.role,
                id: 123,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                beforeInsertActions: jest.fn()
            });
        
            jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');
        
            const result = await service.saveNewUser(dto);
        
            expect(result).toEqual(expect.objectContaining({
                userId: '123',
                email: dto.email,
                role: dto.role,
                accessToken: 'jwtToken'
            }));
            expect(userAuthRepository.saveNewUser).toHaveBeenCalled();
        });
        

        it('should throw error if user cannot be saved', async () => {
            jest.spyOn(userAuthRepository, 'saveNewUser').mockResolvedValue(Promise.resolve(null));
            await expect(service.saveNewUser({ email: 'test@example.com', password: 'pass', role: UserRoleEnum.ADMIN }))
                .rejects.toThrow(UNABLE_TO_SAVE_USER_MESSAGE);
        });
    });

    describe('loginUser', () => {
        it('should login a user and return user details with accessToken', async () => {
            const dto: UserLoginDto = { email: 'test@example.com', password: 'password123' };
            const user = { 
                userId: '123', 
                email: dto.email, 
                role: UserRoleEnum.ADMIN, 
                password: await bcrypt.hash(dto.password, 10),
                id: 123,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                beforeInsertActions: jest.fn()
            };
            jest.spyOn(userAuthRepository, 'getUserByEmail').mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
            jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

            const result = await service.loginUser(dto);

            expect(result).toEqual(expect.objectContaining({
                userId: user.userId,
                email: user.email,
                role: user.role,
                accessToken: 'jwtToken'
            }));
        });

        it('should throw error if user not found', async () => {
            jest.spyOn(userAuthRepository, 'getUserByEmail').mockResolvedValue(null);
            await expect(service.loginUser({ email: 'test@example.com', password: 'password123' }))
                .rejects.toThrow(USER_NOT_FOUND_MESSAGE);
        });
    });

    describe('handleLogout', () => {
        it('should add token to cache blacklist', async () => {
            jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 60 });
            jest.spyOn(cacheManager, 'set').mockResolvedValue(true);

            const result = await service.handleLogout('jwtToken');

            expect(result).toBe(true);
            expect(cacheManager.set).toHaveBeenCalled();
        });
    });
});
