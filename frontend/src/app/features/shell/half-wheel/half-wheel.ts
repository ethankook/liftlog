import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ScrollLockService } from '../../../core/services/scroll-lock';

type CreateWheelAction = 'exercise' | 'workout' | 'label';

@Component({
  selector: 'app-half-wheel',
  imports: [],
  templateUrl: './half-wheel.html',
  styleUrl: './half-wheel.css',
})
export class HalfWheel {
  private readonly scrollLock = inject(ScrollLockService);

  @Output() close = new EventEmitter<void>();
  @Output() selectAction = new EventEmitter<CreateWheelAction>();

  protected readonly actions: Array<{
    id: CreateWheelAction;
    icon: string;
    label: string;
  }> = [
    { id: 'exercise', icon: '🏋️', label: 'Exercise' },
    { id: 'workout', icon: '📋', label: 'Workout' },
    { id: 'label', icon: '🏷️', label: 'Label' },
  ];

  protected readonly segmentPaths: Record<CreateWheelAction, string> = {
    exercise: 'M 120 120 L 0 120 A 120 120 0 0 1 60 16.08 Z',
    workout: 'M 120 120 L 60 16.08 A 120 120 0 0 1 180 16.08 Z',
    label: 'M 120 120 L 180 16.08 A 120 120 0 0 1 240 120 Z',
  };

  ngOnInit() {
    this.scrollLock.lock();
  }

  ngOnDestroy() {
    this.scrollLock.unlock();
  }

  protected onSelect(action: CreateWheelAction) {
    this.selectAction.emit(action);
  }

  protected onKeyActivate(event: KeyboardEvent, action: CreateWheelAction) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.onSelect(action);
  }
}
