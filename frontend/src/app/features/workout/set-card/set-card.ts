import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SetEntry } from '../../../core/types';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-set-card',
  imports: [KeyValuePipe],
  templateUrl: './set-card.html',
  styleUrl: './set-card.css',
})
export class SetCard {
  @Input({ required: true }) set!: SetEntry;
  @Output() select = new EventEmitter<string>();
}
