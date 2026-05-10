import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkoutsService } from '../../../core/services/workouts';
import { Router } from '@angular/router';
import { WorkoutCard } from '../workout-card/workout-card';
import { WorkoutSummary } from '../../../core/types';

@Component({
  selector: 'app-activity-tab',
  imports: [WorkoutCard],
  templateUrl: './activity-tab.html',
  styleUrl: './activity-tab.css',
})
export class ActivityTab implements OnInit {
  workoutsService = inject(WorkoutsService);
  router = inject(Router);
  workouts = signal<WorkoutSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const data = await this.workoutsService.findAll({ limit: 10 });
      data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      this.workouts.set(data);
    } catch (err) {
      this.error.set('Failed to load recent workouts.');
    } finally {
      this.loading.set(false);
    }
  }

  openWorkout(id: string) {
    this.router.navigate(['/workouts', id]);
  }
}
