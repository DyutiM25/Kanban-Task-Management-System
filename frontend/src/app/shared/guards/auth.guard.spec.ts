import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: {
    hasAnyRole: jasmine.Spy;
    hasValidToken: jasmine.Spy;
  };
  let router: {
    createUrlTree: jasmine.Spy;
  };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    authService = {
      hasAnyRole: jasmine.createSpy('hasAnyRole'),
      hasValidToken: jasmine.createSpy('hasValidToken'),
    };
    router = {
      createUrlTree: jasmine.createSpy('createUrlTree'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('redirects unauthenticated users to login', () => {
    authService.hasValidToken.and.returnValue(false);
    router.createUrlTree.and.returnValue('/login');

    const result = executeGuard({ data: {} } as any, {} as any);

    expect(result).toBe('/login' as any);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('redirects authenticated users without the required role', () => {
    authService.hasValidToken.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(false);
    router.createUrlTree.and.returnValue('/login');

    const result = executeGuard(
      { data: { roles: ['admin'] } } as any,
      {} as any,
    );

    expect(result).toBe('/login' as any);
    expect(authService.hasAnyRole).toHaveBeenCalledWith(['admin']);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows authenticated users with an allowed role', () => {
    authService.hasValidToken.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(true);

    const result = executeGuard(
      { data: { roles: ['member'] } } as any,
      {} as any,
    );

    expect(result).toBeTrue();
  });
});
