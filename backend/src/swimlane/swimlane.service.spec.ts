import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Swimlane } from './entities/swimlane.entity';
import { SwimlaneService } from './swimlane.service';

describe('SwimlaneService', () => {
  let service: SwimlaneService;
  let swimlaneRepository: {
    count: jest.Mock;
    delete: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let userService: {
    isConnectedToBoard: jest.Mock;
    isConnectedToSwimlane: jest.Mock;
  };

  beforeEach(async () => {
    swimlaneRepository = {
      count: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      save: jest.fn((swimlane) => Promise.resolve({ id: 1, ...swimlane })),
      update: jest.fn(),
    };
    userService = {
      isConnectedToBoard: jest.fn(),
      isConnectedToSwimlane: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwimlaneService,
        {
          provide: getRepositoryToken(Swimlane),
          useValue: swimlaneRepository,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<SwimlaneService>(SwimlaneService);
  });

  it('checks board access before creating swimlanes', async () => {
    await service.create({ name: 'In Progress', order: 2, boardId: 4 }, 9);

    expect(userService.isConnectedToBoard).toHaveBeenCalledWith(9, 4);
    expect(swimlaneRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'In Progress',
        order: 2,
        boardId: 4,
      }),
    );
  });

  it('reorders swimlanes after checking board access', async () => {
    await expect(
      service.updateSwimlaneOrders(
        {
          boardId: 4,
          items: [
            { id: 1, order: 2 },
            { id: 2, order: 1 },
          ],
        },
        9,
      ),
    ).resolves.toBe(true);

    expect(userService.isConnectedToBoard).toHaveBeenCalledWith(9, 4);
    expect(swimlaneRepository.update).toHaveBeenCalledTimes(2);
  });

  it('reports swimlane access through board membership', async () => {
    swimlaneRepository.count.mockResolvedValue(1);

    await expect(service.hasAccessToSwimlane(2, 9)).resolves.toBe(true);

    expect(swimlaneRepository.count).toHaveBeenCalledWith({
      where: {
        id: 2,
        board: { users: { id: 9 } },
      },
    });
  });
});
