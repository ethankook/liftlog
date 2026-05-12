import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExerciseSummary } from '../../../core/types';
import { Chip } from '../../../shared/components/chip/chip';

@Component({
  selector: 'app-exercise-card',
  imports: [Chip],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.css',
})
export class ExerciseCard {
  @Input({ required: true }) exercise!: ExerciseSummary;
  @Input() variant: 'grid' | 'row' = 'row';
  @Input() selected = false;
  @Output() select = new EventEmitter<string>();
}
