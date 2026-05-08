import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { WorkoutsService } from '../../core/services/workouts';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);
  private workouts = inject(WorkoutsService);

  username = computed(() => this.auth.currentUser()?.username ?? '');

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
  async ngOnInit() {
    try {
      const list = await this.workouts.findAll();
      console.log('Workouts loaded:', list.length);
    } catch (err) {
      console.error('Failed to load workouts:', err);
    }
  }
}
