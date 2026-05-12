import { Component, EventEmitter, Output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HalfWheel } from '../half-wheel/half-wheel';

export type CreateEntityKind = 'exercise' | 'workout' | 'label';

@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, RouterLinkActive, HalfWheel],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.css',
})
export class TabBar {
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
