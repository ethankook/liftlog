import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(username: string, password: string) {
    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.login({ username, password });
      await this.router.navigate(['/']);
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.error.set(err.error.message ?? 'Login failed.');
      } else {
        this.error.set('An unexpected error occurred.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}


