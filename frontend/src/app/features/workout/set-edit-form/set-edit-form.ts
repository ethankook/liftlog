import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SetEntry } from '../../../core/types';
import { KeyValuePipe } from '@angular/common';
import { Button } from '../../../shared/components/action-button/action-button';

@Component({
  selector: 'app-set-edit-form',
  imports: [KeyValuePipe, Button],
  templateUrl: './set-edit-form.html',
  styleUrl: './set-edit-form.css',
})
export class SetEditForm {
  @Input({ required: true }) set!: SetEntry;
  @Input() fieldLabels: Partial<Record<string, string>> = {};
  @Input() busy = false;
  @Output() save = new EventEmitter<{
    setId: string;
    values: Record<string, unknown>;
    notes: string | null;
  }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  localValues: Record<string, unknown> = {};
  localNotes: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['set']) {
      this.localValues = { ...this.set.values };
      this.localNotes = this.set.notes;
    }
  }

  onValueChange(key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.localValues = {
      ...this.localValues,
      [key]: input.value === '' ? null : parseFloat(input.value),
    };
  }

  onNotesChange(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.localNotes = input.value;
  }

  onSave() {
    if (this.busy) return;
    this.save.emit({
      setId: this.set.id,
      values: this.localValues,
      notes: this.localNotes,
    });
  }

  onDelete() {
    if (this.busy) return;
    this.delete.emit(this.set.id);
  }
}
