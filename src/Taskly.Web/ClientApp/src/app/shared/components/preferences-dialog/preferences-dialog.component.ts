import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import type { PreferencesCategory } from './preferences-dialog.interfaces';
import { BrowserPreferencesService } from '../../../core/services/preferences/browser-preferences.service';
import type { AppearancePreferences } from '../../../core/models/user-preferences.interfaces';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';
import { FormActionsComponent } from '../form-actions/form-actions.component';
import { BaseDialogComponent } from '../base';

@Component({
  selector: 'app-preferences-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDividerModule,
    FontAwesomeModule,
    DialogHeaderComponent,
    SidebarMenuComponent,
    FormActionsComponent
  ],
  templateUrl: './preferences-dialog.component.html',
  styleUrl: './preferences-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesDialogComponent extends BaseDialogComponent<void, AppearancePreferences> {
  private readonly browserPreferences = inject(BrowserPreferencesService);

  public readonly dialogTitle = 'Preferences';

  // Store original values to revert on cancel
  private readonly originalDarkMode = this.browserPreferences.getDarkMode() ?? false;
  private readonly originalAnimations = this.browserPreferences.getAnimations() ?? true;

  public readonly icons = {
    preferences: Icons.preferences,
    appearance: Icons.palette
  };

  public readonly categories = signal<readonly PreferencesCategory[]>([
    { id: 'appearance', label: 'Appearance', icon: Icons.palette }
  ]);

  public readonly selectedCategoryId = signal('appearance');
  public readonly saving = signal(false);

  public readonly preferences = signal<AppearancePreferences>({
    darkModeEnabled: this.originalDarkMode,
    animationsEnabled: this.originalAnimations
  });

  public readonly appearancePreferences = computed(() => [
    { id: 'darkModeEnabled', label: 'Dark Mode', description: 'Use dark theme for the application', enabled: this.preferences().darkModeEnabled },
    { id: 'animationsEnabled', label: 'Animations', description: 'Enable UI animations and transitions', enabled: this.preferences().animationsEnabled }
  ]);

  public selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
  }

  public getPreferencesForCategory(categoryId: string): readonly { id: string; label: string; description: string; enabled: boolean }[] {
    return categoryId === 'appearance' ? this.appearancePreferences() : [];
  }

  public togglePreference(preferenceId: string): void {
    this.preferences.update(current => ({
      ...current,
      [preferenceId]: !current[preferenceId as keyof AppearancePreferences]
    }));

    // Apply appearance preferences immediately for preview
    if (preferenceId === 'darkModeEnabled') {
      this.browserPreferences.applyDarkMode(this.preferences().darkModeEnabled);
    } else if (preferenceId === 'animationsEnabled') {
      this.browserPreferences.applyAnimations(this.preferences().animationsEnabled);
    }
  }

  public save(): void {
    const currentPreferences = this.preferences();
    this.browserPreferences.setDarkMode(currentPreferences.darkModeEnabled);
    this.browserPreferences.setAnimations(currentPreferences.animationsEnabled);
    this.browserPreferences.applyDarkMode(currentPreferences.darkModeEnabled);
    this.browserPreferences.applyAnimations(currentPreferences.animationsEnabled);
    this.closeWithResult(currentPreferences);
  }

  public cancel(): void {
    // Revert appearance preview to original values
    this.browserPreferences.applyDarkMode(this.originalDarkMode);
    this.browserPreferences.applyAnimations(this.originalAnimations);
    super.handleCancel();
  }
}
