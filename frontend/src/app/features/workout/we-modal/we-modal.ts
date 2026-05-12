import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Button } from '../../../shared/components/action-button/action-button';
import { Modal } from '../../../shared/components/modal/modal';
import { SetEntry, WorkoutExerciseDetail } from '../../../core/types';
import { SetCard } from '../set-card/set-card';
import { SetEditForm } from '../set-edit-form/set-edit-form';
import { WorkoutsService } from '../../../core/services/workouts';
import { ExercisesService } from '../../../core/services/exercises';

@Component({
  selector: 'app-we-modal',
  imports: [Button, SetCard, SetEditForm, Modal],
  templateUrl: './we-modal.html',
  styleUrl: './we-modal.css',
})
export class WeModal implements OnInit {
  @Input({ required: true }) workoutExercise!: WorkoutExerciseDetail;
  @Input({ required: true }) workoutId!: string;
  @Output() close = new EventEmitter<void>();

  private workoutsService = inject(WorkoutsService);
  private exercisesService = inject(ExercisesService);

  sets = signal<SetEntry[]>([]);
  editingSetId = signal<string | null>(null);
  trackedFieldKeys = signal<string[]>([]);
  loading = signal(true);

  async ngOnInit() {
    this.sets.set(this.workoutExercise.sets);
    try {
      const detail = await this.exercisesService.findOne(this.workoutExercise.exerciseId);
      this.trackedFieldKeys.set(detail.trackedFields.map((f) => f.key));
    } catch {
      // trackedFieldKeys stays empty; existing sets are still editable
    } finally {
      this.loading.set(false);
    }
  }

  async addSet() {
    const values = Object.fromEntries(this.trackedFieldKeys().map((k) => [k, null]));
    try {
      const newSet = await this.workoutsService.addSet(this.workoutId, this.workoutExercise.id, {
        values,
        sortOrder: this.sets().length,
      });
      this.sets.update((s) => [...s, newSet]);
      this.editingSetId.set(newSet.id);
    } catch {
      console.log('Failed to add set');
    }
  }

  async onSetSave(payload: {
    setId: string;
    values: Record<string, unknown>;
    notes: string | null;
  }) {
    try {
      const updated = await this.workoutsService.updateSet(
        this.workoutId,
        this.workoutExercise.id,
        payload.setId,
        { values: payload.values, notes: payload.notes ?? undefined },
      );
      this.sets.update((s) => s.map((set) => (set.id === payload.setId ? updated : set)));
      this.editingSetId.set(null);
    } catch {
      console.log('Failed to save set');
    }
  }

  async onSetDelete(setId: string) {
    try {
      await this.workoutsService.removeSet(this.workoutId, this.workoutExercise.id, setId);
      this.sets.update((s) => s.filter((set) => set.id !== setId));
      this.editingSetId.set(null);
    } catch {
      console.log('Failed to delete set');
    }
  }
}
