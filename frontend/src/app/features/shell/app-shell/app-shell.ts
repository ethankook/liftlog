import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { CreateEntityKind, TabBar } from '../tab-bar/tab-bar';
import { Header } from '../header/header';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, TabBar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = computed(() => this.auth.currentUser()?.username ?? '');
  protected readonly activeCreateModal = signal<CreateEntityKind | null>(null);

  protected openCreateModal(kind: CreateEntityKind) {
    this.activeCreateModal.set(kind);
  }

  protected closeCreateModal() {
    this.activeCreateModal.set(null);
  }

  async onLogout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
