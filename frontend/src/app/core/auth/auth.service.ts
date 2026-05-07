import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, LoginRequest, User } from './auth.types';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<null | User>(null);

  constructor() {
    this.restoreSession();
  }

  private storeTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('liftlog_accessToken', tokens.accessToken);
    localStorage.setItem('liftlog_refreshToken', tokens.refreshToken);
    console.log('Tokens stored');
  }

  private clearTokens() {
    localStorage.removeItem('liftlog_accessToken');
    localStorage.removeItem('liftlog_refreshToken');
    console.log('Tokens cleared');
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('liftlog_accessToken');
    if (accessToken) {
      console.log('Access token found');
      return accessToken;
    }
    console.log('Access token not found');
    return null;
  }

  getRefreshToken() {
    const refreshToken = localStorage.getItem('liftlog_refreshToken');
    if (refreshToken) {
      console.log('Refresh token found');
      return refreshToken;
    }
    console.log('Refresh token not found');
    return null;
  }

  async login(loginRequest: LoginRequest) {
    const url = `${environment.apiUrl}/auth/login`;
    const authResponse = await firstValueFrom(this.http.post<AuthResponse>(url, loginRequest));
    this.currentUser.set(authResponse.user);
    this.storeTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
  }

  async logout() {
    const url = `${environment.apiUrl}/auth/logout`;
    try {
      await firstValueFrom(
        this.http.post<void>(
          url,
          {},
          {
            headers: { Authorization: `Bearer ${this.getAccessToken()}` },
          },
        ),
      );
    } finally {
      this.clearTokens();
      this.currentUser.set(null);
    }
  }

  async me(): Promise<User> {
    const url = `${environment.apiUrl}/auth/me`;
    return firstValueFrom(
      this.http.get<User>(url, {
        headers: { Authorization: `Bearer ${this.getAccessToken()}` },
      }),
    );
  }

  async refresh() {
    const url = `${environment.apiUrl}/auth/refresh`;
    return firstValueFrom(
      this.http.post<AuthResponse>(url, { refreshToken: this.getRefreshToken() }),
    );
  }

  async restoreSession() {
    const accessToken = this.getAccessToken();
    if (!accessToken) return;
    try {
      const user = await this.me();
      this.currentUser.set(user);
    } catch {
      try {
        const authResponse = await this.refresh();
        this.storeTokens({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
        });
        this.currentUser.set(authResponse.user);
      } catch {
        this.clearTokens();
      }
    }
  }
}
