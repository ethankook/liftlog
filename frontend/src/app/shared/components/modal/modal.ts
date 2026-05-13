import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ScrollLockService } from '../../../core/services/scroll-lock';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private readonly scrollLock = inject(ScrollLockService);

  @Input() title?: string;
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    this.scrollLock.lock();
  }

  ngOnDestroy() {
    this.scrollLock.unlock();
  }
}
