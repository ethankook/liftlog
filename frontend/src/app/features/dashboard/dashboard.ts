import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = computed(() => this.auth.currentUser()?.username ?? '');

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
