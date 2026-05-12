import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateExerciseDto, Muscle, MuscleGroup, TrackingField } from '../../../core/types';

const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  'CHEST',
  'SHOULDER',
  'BACK',
  'BICEP',
  'TRICEP',
  'CORE',
  'FOREARM',
  'LEGS',
];

@Component({
  selector: 'app-create-exercise-form',
  imports: [FormsModule],
  templateUrl: './create-exercise-form.html',
  styleUrl: './create-exercise-form.css',
})
export class CreateExerciseForm {
  @Input({ required: true }) muscles: Muscle[] = [];
  @Input({ required: true }) trackingFields: TrackingField[] = [];
  @Input() existingNames: string[] = [];
  @Input() loading = false;

  @Output() submitForm = new EventEmitter<CreateExerciseDto>();
  @Output() cancel = new EventEmitter<void>();

  protected name = '';
  protected primaryMuscleId = '';
  protected secondaryMuscleIds: string[] = [];
  protected trackedFieldIds: string[] = [];

  protected get muscleGroups(): { group: MuscleGroup; muscles: Muscle[] }[] {
    const map = new Map<MuscleGroup, Muscle[]>();
    for (const muscle of this.muscles) {
      if (!map.has(muscle.group)) map.set(muscle.group, []);
      map.get(muscle.group)!.push(muscle);
    }
    return MUSCLE_GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      group: g,
      muscles: map.get(g)!,
    }));
  }

  protected get secondaryMuscleGroups(): { group: MuscleGroup; muscles: Muscle[] }[] {
    return this.muscleGroups
      .map((g) => ({
        group: g.group,
        muscles: g.muscles.filter((m) => m.id !== this.primaryMuscleId),
      }))
      .filter((g) => g.muscles.length > 0);
  }

  protected selectPrimaryMuscle(id: string) {
    this.primaryMuscleId = this.primaryMuscleId === id ? '' : id;
    this.secondaryMuscleIds = this.secondaryMuscleIds.filter((sid) => sid !== id);
  }

  protected toggleSecondaryMuscle(id: string) {
    this.secondaryMuscleIds = this.secondaryMuscleIds.includes(id)
      ? this.secondaryMuscleIds.filter((v) => v !== id)
      : [...this.secondaryMuscleIds, id];
  }

  protected toggleTrackingField(id: string) {
    this.trackedFieldIds = this.trackedFieldIds.includes(id)
      ? this.trackedFieldIds.filter((v) => v !== id)
      : [...this.trackedFieldIds, id];
  }

  protected isSecondaryMuscleSelected(id: string): boolean {
    return this.secondaryMuscleIds.includes(id);
  }

  protected isTrackingFieldSelected(id: string): boolean {
    return this.trackedFieldIds.includes(id);
  }

  protected nameError(): string | null {
    const trimmedName = this.name.trim();
    if (!trimmedName) return 'Exercise name is required.';
    if (this.isDuplicateName(trimmedName)) return 'Exercise name must be unique.';
    return null;
  }

  protected canSubmit(): boolean {
    return !this.nameError() && this.primaryMuscleId.length > 0 && !this.loading;
  }

  protected onSubmit() {
    if (!this.canSubmit()) return;

    this.submitForm.emit({
      name: this.name.trim(),
      primaryMuscleId: this.primaryMuscleId,
      secondaryMuscleIds: this.secondaryMuscleIds.length ? this.secondaryMuscleIds : undefined,
      trackedFieldIds: this.trackedFieldIds.length ? this.trackedFieldIds : undefined,
    });
  }

  private isDuplicateName(name: string): boolean {
    const normalizedName = name.toLocaleLowerCase();
    return this.existingNames.some(
      (existingName) => existingName.trim().toLocaleLowerCase() === normalizedName,
    );
  }
}
