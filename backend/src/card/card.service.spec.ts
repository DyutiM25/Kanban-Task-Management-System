import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';

describe('CardService', () => {
  let service: CardService;
  let cardRepository: {
    delete: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let swimlaneService: { hasAccessToSwimlane: jest.Mock };
  let userService: {
    isConnectedToBoard: jest.Mock;
    isConnectedToSwimlane: jest.Mock;
  };

  beforeEach(async () => {
    cardRepository = {
      delete: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn((card) => Promise.resolve({ id: 1, ...card })),
      update: jest.fn(),
    };
    swimlaneService = {
      hasAccessToSwimlane: jest.fn(),
    };
    userService = {
      isConnectedToBoard: jest.fn(),
      isConnectedToSwimlane: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: cardRepository,
        },
        {
          provide: SwimlaneService,
          useValue: swimlaneService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  it('creates cards only when the user can access the swimlane', async () => {
    swimlaneService.hasAccessToSwimlane.mockResolvedValue(true);

    await expect(
      service.create(
        { name: 'Build tests', content: 'Cover auth', order: 1, swimlaneId: 2 },
        9,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        name: 'Build tests',
        swimlaneId: 2,
      }),
    );

    expect(swimlaneService.hasAccessToSwimlane).toHaveBeenCalledWith(2, 9);
    expect(cardRepository.save).toHaveBeenCalled();
  });

  it('rejects cards for swimlanes outside the user board scope', async () => {
    swimlaneService.hasAccessToSwimlane.mockResolvedValue(false);

    await expect(
      service.create(
        { name: 'Private card', content: '', order: 1, swimlaneId: 2 },
        9,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('checks board membership before reordering cards', async () => {
    await service.updateCardOrdersAndSwimlanes(
      {
        boardId: 4,
        cards: [
          { id: 10, order: 1, swimlaneId: 2 },
          { id: 11, order: 2, swimlaneId: 3 },
        ] as Card[],
      },
      9,
    );

    expect(userService.isConnectedToBoard).toHaveBeenCalledWith(9, 4);
    expect(cardRepository.update).toHaveBeenCalledTimes(2);
  });
});
