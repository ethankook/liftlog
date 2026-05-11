import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private document = inject(DOCUMENT);
  private previousBodyOverflow = '';

  @Input() title?: string;
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    this.document.body.style.overflow = this.previousBodyOverflow;
  }
}
