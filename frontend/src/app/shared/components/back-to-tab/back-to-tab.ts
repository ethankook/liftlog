import { Component, computed, inject } from '@angular/core';
import { NavigationContextService } from '../../../core/services/navigation-context';

@Component({
  selector: 'app-back-to-tab',
  templateUrl: './back-to-tab.html',
  styleUrl: './back-to-tab.css',
})
export class BackToTab {
  private navigationContext = inject(NavigationContextService);

  protected readonly tabLabel = computed(() => this.navigationContext.getLastTab());

  protected async goBack() {
    await this.navigationContext.navigateToLastTab();
  }
}
