import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  const createContext = (request: Record<string, any>): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows routes without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext({ user: undefined }))).toBe(true);
  });

  it('allows users with a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);

    expect(
      guard.canActivate(
        createContext({ user: { id: 1, role: UserRole.Admin } }),
      ),
    ).toBe(true);
  });

  it('rejects users without a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);

    expect(() =>
      guard.canActivate(
        createContext({ user: { id: 1, role: UserRole.Member } }),
      ),
    ).toThrow(ForbiddenException);
  });
});
