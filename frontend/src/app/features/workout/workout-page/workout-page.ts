import { Component, inject, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { WorkoutsService } from '../../../core/services/workouts';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getWorkoutLabelOrDefault,
  WorkoutDetail,
  WorkoutExerciseDetail,
} from '../../../core/types';
import { WorkoutExerciseCard } from '../workout-exercise-card/workout-exercise-card';
import { Button } from '../../../shared/components/action-button/action-button';
import { Chip } from '../../../shared/components/chip/chip';
import { DatePipe } from '@angular/common';
import { AddWorkoutExerciseModal } from '../add-workout-exercise-modal/add-workout-exercise-modal';
import { WeModal } from '../we-modal/we-modal';
import { BackToTab } from '../../../shared/components/back-to-tab/back-to-tab';

@Component({
  selector: 'app-workout-page',
  imports: [
    WorkoutExerciseCard,
    Button,
    Chip,
    DatePipe,
    AddWorkoutExerciseModal,
    WeModal,
    BackToTab,
    CdkDropList,
    CdkDrag,
  ],
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
  selectedWorkoutExercise = signal<WorkoutExerciseDetail | null>(null);
  protected readonly getWorkoutLabel = getWorkoutLabelOrDefault;

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
    const we = this.workout()?.workoutExercises.find((e) => e.id === id) ?? null;
    this.selectedWorkoutExercise.set(we);
  }

  onWorkoutExerciseChange(updatedWorkoutExercise: WorkoutExerciseDetail) {
    this.workout.update((workout) =>
      workout
        ? {
            ...workout,
            workoutExercises: workout.workoutExercises.map((exercise) =>
              exercise.id === updatedWorkoutExercise.id ? updatedWorkoutExercise : exercise,
            ),
          }
        : workout,
    );
    this.selectedWorkoutExercise.set(updatedWorkoutExercise);
  }

  async onWeModalClose() {
    try {
      const refreshed = await this.workoutsService.findOne(this.workoutId);
      this.workout.set(refreshed);
    } catch {
      console.log('Failed to refresh workout after closing exercise modal');
    }
    this.selectedWorkoutExercise.set(null);
  }

  async onExerciseDelete(id: string) {
    if (!this.workoutId) return;
    await this.workoutsService.removeExercise(this.workoutId, id);
    this.workout.update((w) =>
      w ? { ...w, workoutExercises: w.workoutExercises.filter((e) => e.id !== id) } : w,
    );
  }

  async onExerciseDrop(event: CdkDragDrop<WorkoutExerciseDetail[]>) {
    const w = this.workout();
    if (!w || event.previousIndex === event.currentIndex) return;

    const prev = w.workoutExercises;
    const next = [...prev];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.workout.set({ ...w, workoutExercises: next });

    try {
      await this.workoutsService.reorderExercises(this.workoutId, {
        orderedIds: next.map((e) => e.id),
      });
    } catch {
      this.workout.set({ ...w, workoutExercises: prev });
      console.log('Failed to reorder exercises');
    }
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

    try {
      const refreshed = await this.workoutsService.findOne(this.workoutId);
      this.workout.set(refreshed);
    } catch {
      console.log('Failed to refresh workout after adding exercises');
    }
    this.addModalOpen.set(false);
  }

  async onDeleteWorkout() {
    await this.workoutsService.remove(this.workoutId);
    this.router.navigate(['activity']);
  }
}
