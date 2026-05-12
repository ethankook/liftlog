import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkoutExerciseDetail } from '../../../core/types';
import { Button } from '../../../shared/components/action-button/action-button';
import { Chip } from '../../../shared/components/chip/chip';

@Component({
  selector: 'app-workout-exercise-card',
  imports: [Button, Chip],
  templateUrl: './workout-exercise-card.html',
  styleUrl: './workout-exercise-card.css',
})
export class WorkoutExerciseCard {
  @Input({ required: true }) workoutExercise!: WorkoutExerciseDetail;
  @Input() variant: 'grid' | 'row' = 'row';
  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
