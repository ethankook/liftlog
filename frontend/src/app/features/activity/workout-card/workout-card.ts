import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkoutSummary } from '../../../core/types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-workout-card',
  imports: [DatePipe],
  templateUrl: './workout-card.html',
  styleUrl: './workout-card.css',
})
export class WorkoutCard {
  @Input({ required: true }) workout!: WorkoutSummary;
  @Output() select = new EventEmitter<string>();
}
