import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationContextService } from '../../../core/services/navigation-context';
import { HalfWheel } from '../half-wheel/half-wheel';

export type CreateEntityKind = 'exercise' | 'workout' | 'label';

@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, HalfWheel],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.css',
})
export class TabBar {
  protected readonly navigation = inject(NavigationContextService);
  @Output() createAction = new EventEmitter<CreateEntityKind>();
  protected readonly createWheelOpen = signal(false);

  protected toggleCreateWheel(event: Event) {
    event.preventDefault();
    this.createWheelOpen.update((open) => !open);
  }

  protected closeCreateWheel() {
    this.createWheelOpen.set(false);
  }

  protected onCreateAction(action: CreateEntityKind) {
    this.createWheelOpen.set(false);
    this.createAction.emit(action);
  }
}
