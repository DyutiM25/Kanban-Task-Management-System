import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';

describe('BoardService', () => {
  let service: BoardService;
  let boardRepository: {
    count: jest.Mock;
    delete: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let userService: { findOne: jest.Mock };

  beforeEach(async () => {
    boardRepository = {
      count: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((board) => Promise.resolve({ id: 1, ...board })),
      update: jest.fn(),
    };
    userService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(Board),
          useValue: boardRepository,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('creates a board associated to the current user', async () => {
    const user = { id: 3 } as User;
    userService.findOne.mockResolvedValue(user);

    await expect(service.create({ name: 'Sprint Board' }, user.id)).resolves.toEqual(
      expect.objectContaining({
        name: 'Sprint Board',
        users: [user],
      }),
    );

    expect(boardRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sprint Board',
        users: [user],
      }),
    );
  });

  it('throws when a user is not associated with the board', async () => {
    boardRepository.count.mockResolvedValue(0);

    await expect(service.isUserAssociatedWithBoard(4, 9)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('checks board access before updates', async () => {
    boardRepository.count.mockResolvedValue(1);
    boardRepository.update.mockResolvedValue({ affected: 1 });

    await service.update(4, 9, { name: 'Roadmap' });

    expect(boardRepository.count).toHaveBeenCalledWith({
      where: { id: 4, users: { id: 9 } },
    });
    expect(boardRepository.update).toHaveBeenCalledWith(4, {
      name: 'Roadmap',
    });
  });
});
