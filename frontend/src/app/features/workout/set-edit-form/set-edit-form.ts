import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() save = new EventEmitter<{
    setId: string;
    values: Record<string, unknown>;
    notes: string | null;
  }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  localValues: Record<string, unknown> = {};
  localNotes: string | null = null;

  ngOnInit() {
    this.localValues = { ...this.set.values };
    this.localNotes = this.set.notes;
  }

  onValueChange(key: string, event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    this.localValues[key] = parseFloat(input.value);
  }

  onNotesChange(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    this.localNotes = input.value;
  }
}
