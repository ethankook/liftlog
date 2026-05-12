import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWorkoutLabelDto, UpdateWorkoutLabelDto, WorkoutLabel } from '../../../core/types';

@Component({
  selector: 'app-create-label-form',
  imports: [FormsModule],
  templateUrl: './create-label-form.html',
  styleUrl: './create-label-form.css',
})
export class CreateLabelForm {
  @Input() existingNames: string[] = [];
  @Input() loading = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialLabel: WorkoutLabel | null = null;
  @Input() showDelete = false;

  @Output() submitForm = new EventEmitter<CreateWorkoutLabelDto | UpdateWorkoutLabelDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() deleteEntity = new EventEmitter<void>();

  protected name = '';
  protected color = '#6B7280';

  ngOnInit() {
    this.syncFromInitialLabel();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialLabel']) {
      this.syncFromInitialLabel();
    }
  }

  protected nameError(): string | null {
    const trimmedName = this.name.trim();
    if (!trimmedName) return 'Label name is required.';
    if (this.isDuplicateName(trimmedName)) return 'Label name must be unique.';
    return null;
  }

  protected canSubmit(): boolean {
    return !this.nameError() && !this.loading;
  }

  protected canDelete(): boolean {
    return this.showDelete && !this.loading;
  }

  protected onSubmit() {
    if (!this.canSubmit()) return;

    this.submitForm.emit({
      name: this.name.trim(),
      color: this.color,
    });
  }

  private isDuplicateName(name: string): boolean {
    const normalizedName = name.toLocaleLowerCase();
    const initialName = this.initialLabel?.name.trim().toLocaleLowerCase();
    return this.existingNames.some(
      (existingName) =>
        existingName.trim().toLocaleLowerCase() === normalizedName &&
        existingName.trim().toLocaleLowerCase() !== initialName,
    );
  }

  private syncFromInitialLabel() {
    if (!this.initialLabel) {
      this.name = '';
      this.color = '#6B7280';
      return;
    }

    this.name = this.initialLabel.name;
    this.color = this.initialLabel.color ?? '#6B7280';
  }
}
