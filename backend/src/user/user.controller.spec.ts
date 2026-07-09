import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
  };

  const req = { user: { id: 6 } } as unknown as PayloadRequest;

  beforeEach(async () => {
    userService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('loads the authenticated user profile', () => {
    controller.findOne(req);

    expect(userService.findOne).toHaveBeenCalledWith(6);
  });

  it('exposes the admin-only user listing handler', () => {
    controller.findAll();

    expect(userService.findAll).toHaveBeenCalled();
  });
});
