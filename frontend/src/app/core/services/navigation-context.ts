import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

type TopLevelTab = 'dashboard' | 'activity' | 'stats' | 'settings';

const TOP_LEVEL_TABS = new Set<TopLevelTab>(['dashboard', 'activity', 'stats', 'settings']);

@Injectable({ providedIn: 'root' })
export class NavigationContextService {
  private router = inject(Router);

  private readonly currentUrl = signal(this.router.url);
  private readonly lastTopLevelTab = signal<TopLevelTab>('dashboard');

  readonly activeTab = computed<TopLevelTab>(() => {
    const tab = this.getTopLevelTab(this.currentUrl());
    if (tab) return tab;

    const fallback = this.getFallbackTab(this.currentUrl());
    return fallback ?? this.lastTopLevelTab();
  });

  constructor() {
    this.captureUrl(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.captureUrl(event.urlAfterRedirects));
  }

  isTabActive(tab: TopLevelTab) {
    return this.activeTab() === tab;
  }

  getLastTab() {
    return this.activeTab();
  }

  async navigateToLastTab() {
    await this.router.navigate([`/${this.getLastTab()}`]);
  }

  private captureUrl(url: string) {
    this.currentUrl.set(url);

    const tab = this.getTopLevelTab(url);
    if (tab) {
      this.lastTopLevelTab.set(tab);
    }
  }

  private getTopLevelTab(url: string): TopLevelTab | null {
    const segment = this.getFirstSegment(url);
    return segment && TOP_LEVEL_TABS.has(segment as TopLevelTab) ? (segment as TopLevelTab) : null;
  }

  private getFallbackTab(url: string): TopLevelTab | null {
    const segment = this.getFirstSegment(url);
    if (segment === 'workouts') return 'activity';
    return null;
  }

  private getFirstSegment(url: string) {
    const [path] = url.split(/[?#]/, 1);
    return path.split('/').filter(Boolean)[0] ?? '';
  }
}
