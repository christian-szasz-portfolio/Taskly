import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/** Keys for browser-stored preferences. */
const STORAGE_KEYS = {
  darkMode: 'task_darkModeEnabled',
  animations: 'task_animationsEnabled',
} as const;

/**
 * Service for managing browser-stored appearance preferences.
 * These settings are stored in localStorage for immediate application on page load,
 * before any API calls complete.
 */
@Injectable({ providedIn: 'root' })
export class BrowserPreferencesService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Reactive signal reflecting current dark mode state. */
  public readonly darkMode = signal(false);

  /**
   * Gets the dark mode preference from localStorage.
   * @returns The stored preference, or null if not set.
   */
  public getDarkMode(): boolean | null {
    return this.getBooleanPreference(STORAGE_KEYS.darkMode);
  }

  /**
   * Sets the dark mode preference in localStorage.
   * @param enabled Whether dark mode is enabled.
   */
  public setDarkMode(enabled: boolean): void {
    this.setPreference(STORAGE_KEYS.darkMode, enabled);
  }

  /**
   * Gets the animations preference from localStorage.
   * @returns The stored preference, or null if not set.
   */
  public getAnimations(): boolean | null {
    return this.getBooleanPreference(STORAGE_KEYS.animations);
  }

  /**
   * Sets the animations preference in localStorage.
   * @param enabled Whether animations are enabled.
   */
  public setAnimations(enabled: boolean): void {
    this.setPreference(STORAGE_KEYS.animations, enabled);
  }

  /**
   * Applies dark mode to the document body.
   * @param enabled Whether to enable dark mode.
   */
  public applyDarkMode(enabled: boolean): void {
    this.darkMode.set(enabled);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  /**
   * Applies animations preference to the document body.
   * @param enabled Whether to enable animations.
   */
  public applyAnimations(enabled: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (enabled) {
      document.body.classList.remove('reduce-motion');
    } else {
      document.body.classList.add('reduce-motion');
    }
  }

  /**
   * Initializes appearance settings from localStorage.
   * Should be called on app startup.
   */
  public initializeFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const darkMode = this.getDarkMode();
    if (darkMode !== null) {
      this.applyDarkMode(darkMode);
    }

    const animations = this.getAnimations();
    if (animations !== null) {
      this.applyAnimations(animations);
    }
  }

  private getBooleanPreference(key: string): boolean | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const value = localStorage.getItem(key);
    if (value === null) {
      return null;
    }

    return value === 'true';
  }

  private setPreference(key: string, value: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(key, String(value));
  }
}
