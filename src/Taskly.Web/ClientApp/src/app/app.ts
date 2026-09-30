import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, PLATFORM_ID, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BrowserPreferencesService } from './core/services/preferences/browser-preferences.service';
import { TITLE_EVENT_NAME } from './core/constants/global.constants';
import { PAGE_BACKGROUND_CLASSES, pageClassForUrl } from './core/utilities/page-background.utility';
import { AppHeaderComponent } from './shared/components/app-header/app-header.component';
import { ReadOnlyModeBannerComponent } from './shared/components/read-only-mode-banner/read-only-mode-banner.component';
import { TrialWarningBannerComponent } from './shared/components/trial-warning-banner/trial-warning-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent, ReadOnlyModeBannerComponent, TrialWarningBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly browserPreferences = inject(BrowserPreferencesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseTitle = 'Taskly';
  private readonly defaultArea = 'Tasks';
  public readonly currentYear = signal(new Date().getFullYear());

  /** Whether the current route is a full-page splash that renders without the app shell (auth, trial-expired). */
  public readonly isChromelessRoute = signal(false);

  public constructor() {
    // Apply browser-stored appearance preferences immediately on startup
    this.browserPreferences.initializeFromStorage();

    this.applyTitle(this.defaultArea);

    // Track route changes to show/hide shell components and drive the per-page background
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isChromelessRoute.set(this.isChromeless(event.urlAfterRedirects));
        this.applyPageClass(event.urlAfterRedirects);
      });

    // Check initial route
    this.isChromelessRoute.set(this.isChromeless(this.router.url));
    this.applyPageClass(this.router.url);
  }

  @HostListener(`window:${TITLE_EVENT_NAME}`, ['$event'])
  public handleTitleChange(event: CustomEvent<string | null>): void {
    if (event?.detail == null) {
      return;
    }

    this.applyTitle(event.detail);
  }

  /** Full-page splashes render their own layout, without the shell chrome. */
  private isChromeless(url: string): boolean {
    return url.startsWith('/auth') || url.startsWith('/trial-expired');
  }

  /** Swaps the active `page-*` class on <body> so each route gets its own background (mirrors the dark-mode class). */
  private applyPageClass(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const { classList } = document.body;
    classList.remove(...PAGE_BACKGROUND_CLASSES);
    classList.add(pageClassForUrl(url));
  }

  private applyTitle(area?: string | null): void {
    const suffix = this.normalizeArea(area);
    this.title.setTitle(`${this.baseTitle} | ${suffix}`);
  }

  private normalizeArea(area?: string | null): string {
    const trimmed = area?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : this.defaultArea;
  }
}
