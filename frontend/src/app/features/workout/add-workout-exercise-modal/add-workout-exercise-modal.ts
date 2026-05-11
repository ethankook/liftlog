import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Modal } from '../../../shared/components/modal/modal';
import { Button } from '../../../shared/components/action-button/action-button';
import { MusclesService } from '../../../core/services/muscles';
import { ExerciseSummary, Muscle } from '../../../core/types';
import { ExercisesService } from '../../../core/services/exercises';
import { ExerciseCard } from '../../exercise/exercise-card/exercise-card';

@Component({
  selector: 'app-add-workout-exercise-modal',
  imports: [Modal, Button, ExerciseCard],
  templateUrl: './add-workout-exercise-modal.html',
  styleUrl: './add-workout-exercise-modal.css',
})
export class AddWorkoutExerciseModal implements OnInit {
  @Input({ required: true }) workoutId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() added = new EventEmitter<string[]>();

  private musclesService = inject(MusclesService);
  private exercisesService = inject(ExercisesService);

  selectedExercises = signal<string[]>([]);

  toggleSelection(id: string) {
    this.selectedExercises.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  isSelected(id: string): boolean {
    return this.selectedExercises().includes(id);
  }

  muscles = signal<Muscle[]>([]);
  exercises = signal<ExerciseSummary[]>([]);

  async ngOnInit() {
    const muscles = await this.musclesService.findAll();
    this.muscles.set(muscles);

    const exercises = await this.exercisesService.findAll();
    this.exercises.set(exercises);
  }
}
