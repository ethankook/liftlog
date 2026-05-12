import { Injectable, signal } from '@angular/core';
import { CreateEntityKind } from '../../features/shell/tab-bar/tab-bar';

@Injectable({
  providedIn: 'root',
})
export class EntityRefreshService {
  readonly workoutVersion = signal(0);
  readonly exerciseVersion = signal(0);
  readonly labelVersion = signal(0);

  notify(kind: CreateEntityKind) {
    if (kind === 'workout') {
      this.workoutVersion.update((version) => version + 1);
      return;
    }

    if (kind === 'exercise') {
      this.exerciseVersion.update((version) => version + 1);
      return;
    }

    this.labelVersion.update((version) => version + 1);
  }
}
