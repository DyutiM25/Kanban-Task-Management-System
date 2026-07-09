import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { SwimlaneController } from './swimlane.controller';
import { SwimlaneService } from './swimlane.service';

describe('SwimlaneController', () => {
  let controller: SwimlaneController;
  let swimlaneService: {
    create: jest.Mock;
    findAllByBoardId: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
    updateSwimlaneOrders: jest.Mock;
  };

  const req = { user: { id: 6 } } as unknown as PayloadRequest;

  beforeEach(async () => {
    swimlaneService = {
      create: jest.fn(),
      findAllByBoardId: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      updateSwimlaneOrders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwimlaneController],
      providers: [
        {
          provide: SwimlaneService,
          useValue: swimlaneService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SwimlaneController>(SwimlaneController);
  });

  it('creates swimlanes as the authenticated user', () => {
    const dto = { name: 'Review', order: 3, boardId: 2 };

    controller.create(req, dto);

    expect(swimlaneService.create).toHaveBeenCalledWith(dto, 6);
  });

  it('loads board swimlanes as the authenticated user', () => {
    controller.findAll('2', req);

    expect(swimlaneService.findAllByBoardId).toHaveBeenCalledWith(2, 6);
  });
});
