import { Test, TestingModule } from '@nestjs/testing';
import { Utility } from '../../modules/utils/utility';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { UserAuthController } from './controllers/auth.controller';
import { UserAuthService } from './services/user.service';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRoleEnum } from './enums/roles.enum';
import { Request as ExpressRequest } from 'express';



describe('UserAuthController', () => {
  let controller: UserAuthController;
  let userAuthService: UserAuthService;
  let utility: Utility;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAuthController],
      providers: [
        {
          provide: UserAuthService,
          useValue: {
            saveNewUser: jest.fn(),
            loginUser: jest.fn(),
            handleLogout: jest.fn(),
          },
        },
        {
          provide: Utility,
          useValue: {
            validateSignupBody: jest.fn(),
            isValidUserBodyForSignUp: jest.fn(),
            isValidBodyForLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserAuthController>(UserAuthController);
    userAuthService = module.get<UserAuthService>(UserAuthService);
    utility = module.get<Utility>(Utility);
  });

  describe('userSignUp', () => {
    it('should sign up a user successfully', async () => {
      const dto: UserSignUpDto = { email: 'test@example.com', password: 'password123', role: UserRoleEnum.ADMIN };
      const mockUser = { userId: '123', email: dto.email, role: dto.role, accessToken: 'jwtToken' };

      jest.spyOn(utility, 'validateSignupBody').mockReturnValue(true);
      jest.spyOn(utility, 'isValidUserBodyForSignUp').mockReturnValue(true);
      jest.spyOn(userAuthService, 'saveNewUser').mockResolvedValue(mockUser);

      const result = await controller.userSignUp(dto);
      expect(result).toEqual(mockUser);
      expect(userAuthService.saveNewUser).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if signup body is invalid', async () => {
      const dto: UserSignUpDto = { email: '', password: '', role: UserRoleEnum.EDITOR };
      jest.spyOn(utility, 'validateSignupBody').mockReturnValue(false);

      await expect(controller.userSignUp(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('userLogin', () => {
    it('should login a user successfully', async () => {
      const dto: UserLoginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = { userId: '123', email: dto.email, role: 'user', accessToken: 'jwtToken' };

      jest.spyOn(utility, 'isValidBodyForLogin').mockReturnValue(true);
      jest.spyOn(userAuthService, 'loginUser').mockResolvedValue(mockUser);

      const result = await controller.userLogin(dto);
      expect(result).toEqual({ code: 200, message: 'User Logged In', data: mockUser });
    });

    it('should throw BadRequestException if login body is invalid', async () => {
      const dto: UserLoginDto = { email: '', password: '' };
      jest.spyOn(utility, 'isValidBodyForLogin').mockReturnValue(false);

      await expect(controller.userLogin(dto)).rejects.toThrow(BadRequestException);
    });
  });

//   describe('logoutUser', () => {
//     it('should log out a user successfully', async () => {
//         // Mocking the request properly
//         const mockRequest = {
//             headers: {
//                 authorization: 'Bearer jwtToken',
//             },
//         } as unknown as Request; 
    
//         jest.spyOn(userAuthService, 'handleLogout').mockResolvedValue(true);
    
//         const result = await controller.logoutUser(mockRequest as Request);
    
//         expect(result).toEqual({ code: 200, message: 'User Logged Out' });
//         expect(userAuthService.handleLogout).toHaveBeenCalledWith('jwtToken');
//     });

//     it('should throw an error if Authorization header is missing', async () => {
//       const mockRequest = { headers: {} } as unknown as ExpressRequest;
//       await expect(controller.logoutUser(mockRequest)).rejects.toThrow();
//     });
//   });
});
