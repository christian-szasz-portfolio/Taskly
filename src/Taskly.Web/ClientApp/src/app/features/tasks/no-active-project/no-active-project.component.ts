import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { SessionContextService } from '../../../core/services/project/session-context.service';
import { ProjectStore } from '../../../core/state/project.store';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import type { Project } from '../../../core/models/project.interfaces';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

/**
 * Component displayed when no active project is available.
 * Provides guidance to the user and options to navigate to project management.
 */
@Component({
  selector: 'app-no-active-project',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, SkeletonLoaderComponent],
  templateUrl: './no-active-project.component.html',
  styleUrl: './no-active-project.component.scss'
})
export class NoActiveProjectComponent {
  private readonly router = inject(Router);
  private readonly sessionContext = inject(SessionContextService);
  private readonly projectStore = inject(ProjectStore);

  public readonly icons = {
    folder: Icons.folderOpen,
    home: Icons.home,
    project: Icons.projectDiagram,
    refresh: Icons.refresh
  };

  public readonly isLoading = this.sessionContext.isLoading;
  public readonly projects = this.projectStore.activeProjects;

  public readonly hasProjects = computed(() => this.projects().length > 0);

  public constructor() {
    EventBus.send(TITLE_EVENT_NAME, 'No Active Project');
    this.projectStore.load();
  }

  public activateProject(project: Project): void {
    this.projectStore.activate(project.id);

    // Navigate to kanban board with project key after activation
    setTimeout(() => {
      void this.router.navigate(['/tasks', project.key]);
    }, 300);
  }

  public refresh(): void {
    this.projectStore.load();
  }
}
