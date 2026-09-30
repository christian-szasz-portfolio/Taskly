import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { AuthStore } from '../../../core/state/auth.store';
import { NotificationStore } from '../../../core/state/notification.store';
import { ProjectStore } from '../../../core/state/project.store';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { ProjectListComponent } from '../components/project-list/project-list.component';
import { PreferencesDialogComponent } from '../../../shared/components/preferences-dialog/preferences-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import type { Project } from '../../../core/models/project.interfaces';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    FontAwesomeModule,
    ProjectListComponent,
    EmptyStateComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly authStore = inject(AuthStore);
  private readonly notificationStore = inject(NotificationStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  public readonly vm = this.projectStore.vm;
  public readonly projects = this.projectStore.ownedProjects;

  public readonly icons = signal({
    notifications: Icons.bell,
    preferences: Icons.preferences,
    addProject: Icons.folderPlus,
    import: Icons.import,
    activity: Icons.activity
  });

  public readonly notificationCount = computed(() => this.notificationStore.vm().unreadCount);
  public readonly userName = computed(() => this.authStore.firstName() || 'User');

  public readonly isEmpty = computed(() => this.projects().length === 0);

  /** Why the create and import buttons are disabled: the seeded projects frame the whole demo */
  public readonly disabledNotes = {
    createProject: 'The demo does not allow creating projects.',
    importProject: 'The demo does not allow importing projects.'
  };

  public constructor() {
    this.projectStore.load();
    this.notificationStore.loadUnreadCount();
    EventBus.send(TITLE_EVENT_NAME, 'Home');
  }

  public handleActivateProject(project: Project): void {
    this.projectStore.activate(project.id);
  }

  public handleDeactivateProject(project: Project): void {
    this.projectStore.deactivate(project.id);
  }

  public refresh(): void {
    this.projectStore.load();
  }

  public openPreferencesDialog(): void {
    this.dialog.open(PreferencesDialogComponent, {
      width: '720px',
      maxWidth: '90vw',
      autoFocus: 'first-tabbable'
    });
  }
}
