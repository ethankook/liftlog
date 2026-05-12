import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { CreateEntityKind, TabBar } from '../tab-bar/tab-bar';
import { Header } from '../header/header';
import { CreateEntityModal } from '../create-entity-modal/create-entity-modal';
import { EntityRefreshService } from '../../../core/services/entity-refresh';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, TabBar, CreateEntityModal],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private auth = inject(AuthService);
  private router = inject(Router);
  private entityRefresh = inject(EntityRefreshService);
  username = computed(() => this.auth.currentUser()?.username ?? '');
  protected readonly activeCreateModal = signal<CreateEntityKind | null>(null);

  protected openCreateModal(kind: CreateEntityKind) {
    this.activeCreateModal.set(kind);
  }

  protected closeCreateModal() {
    this.activeCreateModal.set(null);
  }

  protected onEntityCreated(event: { id: string; kind: CreateEntityKind }) {
    this.entityRefresh.notify(event.kind);
    this.closeCreateModal();
  }

  async onLogout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
