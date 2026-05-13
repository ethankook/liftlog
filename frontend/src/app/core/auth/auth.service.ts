import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponse, LoginRequest, User } from './auth.types';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<null | User>(null);
  private restorationPromise: Promise<void>;

  constructor() {
    this.restorationPromise = new Promise<void>((resolve) =>
      setTimeout(async () => {
        await this.restoreSession();
        resolve();
      }),
    );
  }

  waitForRestoration() {
    return this.restorationPromise;
  }

  private storeTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('liftlog_accessToken', tokens.accessToken);
    localStorage.setItem('liftlog_refreshToken', tokens.refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('liftlog_accessToken');
    localStorage.removeItem('liftlog_refreshToken');
  }

  getAccessToken() {
    return localStorage.getItem('liftlog_accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('liftlog_refreshToken');
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
      await firstValueFrom(this.http.post<void>(url, {}));
    } finally {
      this.clearTokens();
      this.currentUser.set(null);
    }
  }

  async me(): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${environment.apiUrl}/auth/me`, {}));
  }

  async refresh() {
    const url = `${environment.apiUrl}/auth/refresh`;
    const authResponse = await firstValueFrom(
      this.http.post<AuthResponse>(url, { refreshToken: this.getRefreshToken() }),
    );

    this.storeTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });

    return authResponse;
  }

  async restoreSession() {
    const accessToken = this.getAccessToken();
    if (!accessToken) return;
    try {
      const user = await this.me();
      this.currentUser.set(user);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
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
      // any other error (network down, 500, etc.) → leave tokens alone
    }
  }
}
