import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class Button {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) variant!: 'create' | 'update' | 'delete' | 'cancel' | 'other';
  @Input() disabled = false;
  @Output() action = new EventEmitter<void>();
}
