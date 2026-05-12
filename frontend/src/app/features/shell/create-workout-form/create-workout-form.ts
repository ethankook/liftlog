import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWorkoutDto, WorkoutLabel } from '../../../core/types';

@Component({
  selector: 'app-create-workout-form',
  imports: [FormsModule],
  templateUrl: './create-workout-form.html',
  styleUrl: './create-workout-form.css',
})
export class CreateWorkoutForm {
  @Input({ required: true }) labels: WorkoutLabel[] = [];
  @Input() loading = false;

  @Output() submitForm = new EventEmitter<CreateWorkoutDto>();
  @Output() cancel = new EventEmitter<void>();

  protected title = '';
  protected labelId = '';
  protected bodyWeight: number | null = null;
  protected notes = '';
  protected date = '';
  protected time = '';

  protected toggleLabel(id: string) {
    this.labelId = this.labelId === id ? '' : id;
  }

  protected setNow() {
    const now = new Date();
    this.date = now.toLocaleDateString('en-CA');
    this.time = now.toTimeString().slice(0, 5);
  }

  protected setToday() {
    this.date = new Date().toLocaleDateString('en-CA');
  }

  protected setYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    this.date = d.toLocaleDateString('en-CA');
  }

  protected canSubmit(): boolean {
    return this.title.trim().length > 0 && !this.loading;
  }

  protected onSubmit() {
    if (!this.canSubmit()) return;

    const dateTime = this.date ? `${this.date}T${this.time || '00:00'}` : undefined;

    this.submitForm.emit({
      title: this.title.trim(),
      labelId: this.labelId || undefined,
      bodyWeight: this.bodyWeight ?? undefined,
      notes: this.notes.trim() || undefined,
      dateTime,
    });
  }
}
