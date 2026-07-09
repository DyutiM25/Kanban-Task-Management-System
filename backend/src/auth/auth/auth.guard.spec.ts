import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/user/entities/user.entity';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let jwtService: { verifyAsync: jest.Mock };
  let guard: AuthGuard;

  const createContext = (request: Record<string, any>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    guard = new AuthGuard(jwtService as unknown as JwtService);
  });

  it('attaches the decoded JWT payload to the request', async () => {
    const request = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    const payload = {
      id: 1,
      email: 'dyuti@example.com',
      role: UserRole.Member,
    };
    jwtService.verifyAsync.mockResolvedValue(payload);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request['user']).toEqual(payload);
  });

  it('rejects missing tokens', async () => {
    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid bearer tokens', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      guard.canActivate(
        createContext({ headers: { authorization: 'Bearer bad-token' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
