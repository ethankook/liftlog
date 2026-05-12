import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {
  @Input({ required: true }) label!: string;
  @Input() bgColor = 'rgba(255, 255, 255, 0.12)';
  @Input() textColor = '#ffffff';
}
