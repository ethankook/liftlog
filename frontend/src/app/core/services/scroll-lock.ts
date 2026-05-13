import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private readonly document = inject(DOCUMENT);
  private lockCount = 0;
  private previousBodyOverflow = '';

  lock() {
    if (this.lockCount === 0) {
      this.previousBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
    }

    this.lockCount += 1;
  }

  unlock() {
    if (this.lockCount === 0) {
      return;
    }

    this.lockCount -= 1;

    if (this.lockCount === 0) {
      this.document.body.style.overflow = this.previousBodyOverflow;
      this.previousBodyOverflow = '';
    }
  }
}
