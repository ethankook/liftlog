import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HalfWheel } from '../half-wheel/half-wheel';

@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, RouterLinkActive, HalfWheel],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.css',
})
export class TabBar {
  protected readonly createWheelOpen = signal(false);

  protected toggleCreateWheel(event: Event) {
    event.preventDefault();
    this.createWheelOpen.update((open) => !open);
  }

  protected closeCreateWheel() {
    this.createWheelOpen.set(false);
  }

  protected onCreateAction(action: 'exercise' | 'workout' | 'label') {
    this.createWheelOpen.set(false);
    console.log(`Open create ${action} modal here`);
  }
}
