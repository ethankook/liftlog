import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getWorkoutLabelOrDefault, WorkoutSummary } from '../../../core/types';
import { DatePipe } from '@angular/common';
import { Chip } from '../../../shared/components/chip/chip';

@Component({
  selector: 'app-workout-card',
  imports: [DatePipe, Chip],
  templateUrl: './workout-card.html',
  styleUrl: './workout-card.css',
})
export class WorkoutCard {
  @Input({ required: true }) workout!: WorkoutSummary;
  @Input() variant: 'grid' | 'row' = 'row';
  @Output() select = new EventEmitter<string>();

  protected readonly getWorkoutLabel = getWorkoutLabelOrDefault;
}
