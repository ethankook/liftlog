import { Component, effect, inject, signal } from '@angular/core';
import { WorkoutsService } from '../../../core/services/workouts';
import { Router } from '@angular/router';
import { WorkoutCard } from '../workout-card/workout-card';
import { WorkoutSummary } from '../../../core/types';
import { EntityRefreshService } from '../../../core/services/entity-refresh';

@Component({
  selector: 'app-activity-tab',
  imports: [WorkoutCard],
  templateUrl: './activity-tab.html',
  styleUrl: './activity-tab.css',
})
export class ActivityTab {
  workoutsService = inject(WorkoutsService);
  router = inject(Router);
  entityRefresh = inject(EntityRefreshService);
  workouts = signal<WorkoutSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.entityRefresh.workoutVersion();
      void this.loadWorkouts();
    });
  }

  private async loadWorkouts() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.workoutsService.findAll({ limit: 10 });
      data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      this.workouts.set(data);
    } catch {
      this.error.set('Failed to load recent workouts.');
    } finally {
      this.loading.set(false);
    }
  }

  openWorkout(id: string) {
    this.router.navigate(['/workouts', id]);
  }
}
