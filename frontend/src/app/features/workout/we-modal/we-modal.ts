import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Button } from '../../../shared/components/action-button/action-button';
import { Modal } from '../../../shared/components/modal/modal';
import { SetEntry, WorkoutExerciseDetail } from '../../../core/types';
import { SetCard } from '../set-card/set-card';
import { SetEditForm } from '../set-edit-form/set-edit-form';
import { WorkoutsService } from '../../../core/services/workouts';
import { ExercisesService } from '../../../core/services/exercises';

@Component({
  selector: 'app-we-modal',
  imports: [Button, SetCard, SetEditForm, Modal, CdkDropList, CdkDrag],
  templateUrl: './we-modal.html',
  styleUrl: './we-modal.css',
})
export class WeModal implements OnInit {
  @Input({ required: true }) workoutExercise!: WorkoutExerciseDetail;
  @Input({ required: true }) workoutId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() workoutExerciseChange = new EventEmitter<WorkoutExerciseDetail>();

  private workoutsService = inject(WorkoutsService);
  private exercisesService = inject(ExercisesService);
  private cdr = inject(ChangeDetectorRef);

  sets = signal<SetEntry[]>([]);
  editingSetId = signal<string | null>(null);
  pendingSetId = signal<string | null>(null);
  trackedFieldKeys = signal<string[]>([]);
  trackedFieldLabels = signal<Record<string, string>>({});
  loading = signal(true);

  async ngOnInit() {
    this.sets.set(this.workoutExercise.sets);
    try {
      const detail = await this.exercisesService.findOne(this.workoutExercise.exerciseId);
      this.trackedFieldKeys.set(detail.trackedFields.map((f) => f.key));
      this.trackedFieldLabels.set(
        Object.fromEntries(detail.trackedFields.map((f) => [f.key, f.label])),
      );
    } catch {
      // trackedFieldKeys stays empty; existing sets are still editable
    } finally {
      this.loading.set(false);
    }
  }

  async addSet() {
    const values = Object.fromEntries(this.trackedFieldKeys().map((k) => [k, null]));
    const tempId = `draft-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const draftSet: SetEntry = {
      id: tempId,
      workoutExerciseId: this.workoutExercise.id,
      values,
      notes: null,
      sortOrder: this.sets().length,
      createdAt: now,
      updatedAt: now,
    };
    this.sets.update((s) => [...s, draftSet]);
    this.editingSetId.set(tempId);
    this.emitWorkoutExerciseChange();
  }

  async onSetSave(payload: {
    setId: string;
    values: Record<string, unknown>;
    notes: string | null;
  }) {
    if (this.pendingSetId()) return;
    this.pendingSetId.set(payload.setId);

    if (this.isDraftSet(payload.setId)) {
      const draft = this.sets().find((set) => set.id === payload.setId);
      if (!draft) {
        this.pendingSetId.set(null);
        return;
      }

      try {
        const optimisticSet: SetEntry = {
          ...draft,
          values: payload.values,
          notes: payload.notes,
          updatedAt: new Date().toISOString(),
        };
        this.replaceSet(payload.setId, optimisticSet);
        this.finishSetEdit();

        const createdSet = await this.workoutsService.addSet(
          this.workoutId,
          this.workoutExercise.id,
          {
            values: payload.values,
            notes: payload.notes ?? undefined,
            sortOrder: draft.sortOrder,
          },
        );
        this.replaceSet(payload.setId, createdSet);
      } catch {
        console.log('Failed to create set');
      } finally {
        this.pendingSetId.set(null);
      }
      return;
    }

    const existing = this.sets().find((set) => set.id === payload.setId);
    if (!existing) {
      this.pendingSetId.set(null);
      return;
    }

    try {
      const optimisticSet: SetEntry = {
        ...existing,
        values: payload.values,
        notes: payload.notes,
        updatedAt: new Date().toISOString(),
      };
      this.replaceSet(payload.setId, optimisticSet);
      this.finishSetEdit();

      const updatedSet = await this.workoutsService.updateSet(
        this.workoutId,
        this.workoutExercise.id,
        payload.setId,
        { values: payload.values, notes: payload.notes ?? undefined },
      );
      this.replaceSet(payload.setId, updatedSet);
    } catch {
      console.log('Failed to save set');
    } finally {
      this.pendingSetId.set(null);
    }
  }

  async onSetDrop(event: CdkDragDrop<SetEntry[]>) {
    if (event.previousIndex === event.currentIndex) return;
    if (this.editingSetId() !== null) return;

    const prev = this.sets();
    const next = [...prev];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.sets.set(next);
    this.emitWorkoutExerciseChange();

    const orderedIds = next.map((s) => s.id).filter((id) => !this.isDraftSet(id));

    try {
      await this.workoutsService.reorderSets(this.workoutId, this.workoutExercise.id, {
        orderedIds,
      });
    } catch {
      this.sets.set(prev);
      this.emitWorkoutExerciseChange();
      console.log('Failed to reorder sets');
    }
  }

  async onSetDelete(setId: string) {
    if (this.isDraftSet(setId)) {
      this.sets.update((s) => s.filter((set) => set.id !== setId));
      this.editingSetId.set(null);
      this.emitWorkoutExerciseChange();
      return;
    }

    try {
      this.pendingSetId.set(setId);
      this.removeSet(setId);
      this.finishSetEdit();

      await this.workoutsService.removeSet(this.workoutId, this.workoutExercise.id, setId);
    } catch {
      console.log('Failed to delete set');
    } finally {
      this.pendingSetId.set(null);
    }
  }

  onSetCancel(setId: string) {
    if (this.isDraftSet(setId)) {
      this.sets.update((s) => s.filter((set) => set.id !== setId));
      this.emitWorkoutExerciseChange();
    }
    this.editingSetId.set(null);
  }

  private isDraftSet(setId: string) {
    return setId.startsWith('draft-');
  }

  private emitWorkoutExerciseChange() {
    const updatedWorkoutExercise = {
      ...this.workoutExercise,
      sets: this.sets(),
    };
    this.workoutExercise = updatedWorkoutExercise;
    this.workoutExerciseChange.emit(updatedWorkoutExercise);
  }

  private replaceSet(oldSetId: string, nextSet: SetEntry) {
    this.sets.update((sets) => sets.map((set) => (set.id === oldSetId ? nextSet : set)));
    this.emitWorkoutExerciseChange();
    this.cdr.detectChanges();
  }

  private removeSet(setId: string) {
    this.sets.update((sets) => sets.filter((set) => set.id !== setId));
    this.emitWorkoutExerciseChange();
    this.cdr.detectChanges();
  }

  private finishSetEdit() {
    this.editingSetId.set(null);
    this.cdr.detectChanges();
  }
}
