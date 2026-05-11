import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  @Input({ required: true }) label!: string;
  @Output() action = new EventEmitter<void>();
}
