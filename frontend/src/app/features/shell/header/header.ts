import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../../../shared/components/action-button/action-button';

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() username = '';
  @Output() logout = new EventEmitter<void>();
}
