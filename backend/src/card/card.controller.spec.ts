import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { CardController } from './card.controller';
import { CardService } from './card.service';

describe('CardController', () => {
  let controller: CardController;
  let cardService: {
    create: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
    updateCardOrdersAndSwimlanes: jest.Mock;
  };

  const req = { user: { id: 6 } } as unknown as PayloadRequest;

  beforeEach(async () => {
    cardService = {
      create: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      updateCardOrdersAndSwimlanes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: cardService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('creates cards as the authenticated user', () => {
    const dto = { name: 'Ship UI', content: 'Done', order: 1, swimlaneId: 3 };

    controller.create(dto, req);

    expect(cardService.create).toHaveBeenCalledWith(dto, 6);
  });

  it('reorders cards as the authenticated user', () => {
    const dto = { boardId: 2, cards: [] };

    controller.updateOrder(dto, req);

    expect(cardService.updateCardOrdersAndSwimlanes).toHaveBeenCalledWith(dto, 6);
  });
});
