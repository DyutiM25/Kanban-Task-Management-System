import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const createToken = (payload: Record<string, unknown>) => {
    const encodedPayload = window
      .btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `e30.${encodedPayload}.signature`;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    spyOn(Date, 'now').and.returnValue(1_000_000);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('accepts unexpired JWTs', () => {
    service.token = createToken({ exp: 2_000, role: 'member' });

    expect(service.hasValidToken()).toBeTrue();
  });

  it('rejects expired JWTs', () => {
    service.token = createToken({ exp: 500, role: 'member' });

    expect(service.hasValidToken()).toBeFalse();
  });

  it('checks role membership from the JWT payload', () => {
    service.token = createToken({ exp: 2_000, role: 'admin' });

    expect(service.hasAnyRole(['admin'])).toBeTrue();
    expect(service.hasAnyRole(['member'])).toBeFalse();
    expect(service.role).toBe('admin');
  });

  it('removes stored tokens on sign out', () => {
    service.token = createToken({ exp: 2_000, role: 'member' });

    service.token = undefined;

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.hasValidToken()).toBeFalse();
  });
});
