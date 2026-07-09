import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: { findOne: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('signs a JWT with the authenticated user role', async () => {
    const password = 'Password123!';
    const user = {
      id: 7,
      email: 'dyuti@example.com',
      password: bcrypt.hashSync(password, 10),
      role: UserRole.Admin,
    };
    userRepository.findOne.mockResolvedValue(user);

    await expect(
      service.login({ email: 'DYUTI@example.com', password }),
    ).resolves.toEqual({ accessToken: 'signed-jwt' });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'dyuti@example.com' },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      email: user.email,
      id: user.id,
      role: UserRole.Admin,
    });
  });

  it('throws when the user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(undefined);

    await expect(
      service.login({ email: 'missing@example.com', password: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the password does not match', async () => {
    userRepository.findOne.mockResolvedValue({
      password: bcrypt.hashSync('correct-password', 10),
    });

    await expect(
      service.login({ email: 'dyuti@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
