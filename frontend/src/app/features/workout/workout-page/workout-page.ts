import { Component, inject, signal } from '@angular/core';
import { WorkoutsService } from '../../../core/services/workouts';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutDetail } from '../../../core/types';
import { WorkoutExerciseCard } from '../workout-exercise-card/workout-exercise-card';
import { Button } from '../../../shared/components/action-button/action-button';
import { DatePipe } from '@angular/common';
import { AddWorkoutExerciseModal } from '../add-workout-exercise-modal/add-workout-exercise-modal';

@Component({
  selector: 'app-workout-page',
  imports: [WorkoutExerciseCard, Button, DatePipe, AddWorkoutExerciseModal],
  templateUrl: './workout-page.html',
  styleUrl: './workout-page.css',
})
export class WorkoutPage {
  private workoutsService = inject(WorkoutsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workoutId = '';
  workout = signal<WorkoutDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  addModalOpen = signal<boolean>(false);

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    try {
      const data = await this.workoutsService.findOne(id);
      this.workoutId = id;
      this.workout.set(data);
    } catch {
      this.error.set('Failed to load workout.');
    } finally {
      this.loading.set(false);
    }
  }

  async updateField(field: string, event: FocusEvent) {
    if (!this.workoutId) return;
    const input = event.target as HTMLInputElement;
    let value: string | number = input.value;

    if (field === 'bodyWeight') {
      const num = parseFloat(input.value);
      if (isNaN(num)) return;
      value = num;
    }

    await this.workoutsService.update(this.workoutId, { [field]: value });
    this.workout.update((w) => (w ? { ...w, [field]: value } : w));
  }

  onExerciseSelect(id: string) {
    console.log('TODO: open modal for exercise', id);
  }

  async onExerciseDelete(id: string) {
    if (!this.workoutId) return;
    await this.workoutsService.removeExercise(this.workoutId, id);
  }

  onAddExercise() {
    this.addModalOpen.set(true);
  }

  async onExerciseAdded(ids: string[]) {
    for (const id of ids) {
      try {
        await this.workoutsService.addExercise(this.workoutId, { exerciseId: id });
      } catch (err) {
        console.log('Failed to add exercise');
      }
    }
    this.addModalOpen.set(false);
  }
}
