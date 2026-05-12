import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWorkoutLabelDto } from '../../../core/types';

@Component({
  selector: 'app-create-label-form',
  imports: [FormsModule],
  templateUrl: './create-label-form.html',
  styleUrl: './create-label-form.css',
})
export class CreateLabelForm {
  @Input() existingNames: string[] = [];
  @Input() loading = false;

  @Output() submitForm = new EventEmitter<CreateWorkoutLabelDto>();
  @Output() cancel = new EventEmitter<void>();

  protected name = '';
  protected color = '#6B7280';

  protected nameError(): string | null {
    const trimmedName = this.name.trim();
    if (!trimmedName) return 'Label name is required.';
    if (this.isDuplicateName(trimmedName)) return 'Label name must be unique.';
    return null;
  }

  protected canSubmit(): boolean {
    return !this.nameError() && !this.loading;
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
    return this.existingNames.some(
      (existingName) => existingName.trim().toLocaleLowerCase() === normalizedName,
    );
  }
}
