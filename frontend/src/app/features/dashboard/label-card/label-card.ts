import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkoutLabel } from '../../../core/types';

@Component({
  selector: 'app-label-card',
  imports: [],
  templateUrl: './label-card.html',
  styleUrl: './label-card.css',
})
export class LabelCard {
  @Input({ required: true }) label!: WorkoutLabel;
  @Output() select = new EventEmitter<string>();
}
