import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;
  let boardService: {
    create: jest.Mock;
    findAllByUserId: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
  };

  const req = { user: { id: 5 } } as unknown as PayloadRequest;

  beforeEach(async () => {
    boardService = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: boardService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('creates boards for the authenticated user', () => {
    controller.create({ name: 'Sprint Board' }, req);

    expect(boardService.create).toHaveBeenCalledWith({ name: 'Sprint Board' }, 5);
  });

  it('sorts swimlanes and cards when returning board details', async () => {
    boardService.findOne.mockResolvedValue({
      id: 1,
      swimlanes: [
        {
          id: 2,
          order: 2,
          cards: [{ id: 3, order: 2 }, { id: 4, order: 1 }],
        },
        {
          id: 1,
          order: 1,
          cards: [],
        },
      ],
    });

    const board = await controller.findOne('1', req);

    expect(boardService.findOne).toHaveBeenCalledWith(1, 5);
    expect(board.swimlanes.map((swimlane) => swimlane.id)).toEqual([1, 2]);
    expect(board.swimlanes[1].cards.map((card) => card.id)).toEqual([4, 3]);
  });
});
