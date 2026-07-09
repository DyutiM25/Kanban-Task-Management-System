import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    delete: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      delete: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn((user) => Promise.resolve({ id: 1, ...user })),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('creates member users with normalized emails', async () => {
    await service.create({
      email: 'DYUTI@example.com',
      password: 'Password123!',
      firstName: 'Dyuti',
      lastName: 'Mengji',
    });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'dyuti@example.com',
        role: UserRole.Member,
      }),
    );
  });

  it('loads all users without selecting passwords', async () => {
    await service.findAll();

    expect(userRepository.find).toHaveBeenCalledWith({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerified: true,
        role: true,
      },
    });
  });

  it('throws when the user is not connected to a board', async () => {
    userRepository.findOne.mockResolvedValue(undefined);

    await expect(service.isConnectedToBoard(9, 4)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
