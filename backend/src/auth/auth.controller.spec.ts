import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };
  let userService: { create: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue({ accessToken: 'jwt' }),
    };
    userService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('registers a member user and returns a login token', async () => {
    const registerDto = {
      email: 'DYUTI@example.com',
      password: 'Password123!',
      firstName: 'Dyuti',
      lastName: 'Mengji',
    };
    userService.create.mockResolvedValue({
      id: 1,
      email: 'dyuti@example.com',
      role: UserRole.Member,
    });

    await expect(controller.create(registerDto)).resolves.toEqual({
      accessToken: 'jwt',
    });
    expect(userService.create).toHaveBeenCalledWith({
      ...registerDto,
      email: 'dyuti@example.com',
    });
    expect(authService.login).toHaveBeenCalledWith({
      email: 'dyuti@example.com',
      password: registerDto.password,
    });
  });

  it('throws when registration fails', async () => {
    userService.create.mockResolvedValue(undefined);

    await expect(
      controller.create({
        email: 'dyuti@example.com',
        password: 'Password123!',
        firstName: 'Dyuti',
        lastName: 'Mengji',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('passes login credentials to the auth service', async () => {
    const loginDto = { email: 'dyuti@example.com', password: 'Password123!' };

    await controller.login(loginDto);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
  });
});
