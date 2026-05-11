import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExerciseSummary } from '../../../core/types';

@Component({
  selector: 'app-exercise-card',
  imports: [],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.css',
})
export class ExerciseCard {
  @Input({ required: true }) exercise!: ExerciseSummary;
  @Output() select = new EventEmitter<string>();
}
