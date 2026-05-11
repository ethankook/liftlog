import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkoutExerciseDetail } from '../../../core/types';

@Component({
  selector: 'app-workout-exercise-card',
  imports: [],
  templateUrl: './workout-exercise-card.html',
  styleUrl: './workout-exercise-card.css',
})
export class WorkoutExerciseCard {
  @Input({ required: true }) workoutExercise!: WorkoutExerciseDetail;
  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
