import { Component, Input, signal } from '@angular/core';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-create-entity-modal',
  imports: [Modal],
  templateUrl: './create-entity-modal.html',
  styleUrl: './create-entity-modal.css',
})
export class CreateEntityModal {
  @Input({ required: true }) kind!: string;

  protected loading = signal(false);
  protected error = signal<string | null>(null);
}
