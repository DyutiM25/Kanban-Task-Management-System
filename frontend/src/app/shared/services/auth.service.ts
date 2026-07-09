import { Injectable, WritableSignal, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../models/user.model';

interface JwtPayload {
  exp?: number;
  role?: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _token = signal<string | undefined>(undefined);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this._token.set(token);
    }
  }

  set token(_token: string | undefined) {
    this._token.set(_token);
    if (_token) {
      localStorage.setItem('token', _token);
    } else {
      localStorage.removeItem('token');
    }
  }

  get token(): WritableSignal<string | undefined> {
    return this._token;
  }

  hasValidToken(): boolean {
    const decodedToken = this.decodeToken();
    if (!decodedToken) return false;
    const now = Date.now() / 1000;
    if (!decodedToken.exp) return false;
    return decodedToken.exp > now;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    if (!roles.length) return this.hasValidToken();
    const decodedToken = this.decodeToken();
    return (
      this.hasValidToken() &&
      !!decodedToken?.role &&
      roles.includes(decodedToken.role)
    );
  }

  get role(): UserRole | undefined {
    return this.decodeToken()?.role;
  }

  private decodeToken(): JwtPayload | undefined {
    const token = this._token();
    if (!token) return undefined;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return undefined;
    }
  }
}
