import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import type { Project } from '../../../../core/models/project.interfaces';
import { ProjectStatus } from '../../../../core/models/task.enums';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, FontAwesomeModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  public readonly project = input.required<Project>();

  public readonly activate = output<void>();
  public readonly deactivate = output<void>();

  public readonly isExpanded = signal(false);

  public readonly icons = signal({
    edit: Icons.edit,
    expand: Icons.chevronDown,
    collapse: Icons.chevronUp,
    owner: Icons.user,
    dueDate: Icons.calendarDays,
    labels: Icons.tags,
    components: Icons.components,
    power: Icons.power
  });

  public readonly projectKey = computed(() => this.project().key ?? 'NO KEY');

  public readonly isActive = computed(() => this.project().status === ProjectStatus.Active);

  public readonly statusLabel = computed(() => (this.isActive() ? 'Active' : 'Inactive'));

  public readonly hasDetails = computed(() => {
    const proj = this.project();
    const hasDescription = proj.description != null && proj.description.length > 0;
    const hasLabels = proj.labels.length > 0;
    const hasComponents = proj.components.length > 0;
    const hasDueDate = proj.dueAtUtc != null;
    const hasOwner = proj.owner != null && proj.owner.length > 0;
    return hasDescription || hasLabels || hasComponents || hasDueDate || hasOwner;
  });

  public readonly formattedDueDate = computed(() => {
    const dueAtUtc = this.project().dueAtUtc;
    if (!dueAtUtc) {
      return null;
    }
    const date = new Date(dueAtUtc);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  /** The seeded projects frame the whole demo, so they stay as they are */
  public readonly editDisabledNote =
    'The demo does not allow editing projects: the seeded projects are fixed. Tasks inside them are fully editable.';

  /** Tooltip for the activate/deactivate button. */
  public readonly activateTooltip = computed(() =>
    this.isActive() ? 'Deactivate project' : 'Activate project'
  );

  public toggleExpanded(event: Event): void {
    event.stopPropagation();
    this.isExpanded.update((value) => !value);
  }

  public handleActivateToggle(event: Event): void {
    event.stopPropagation();
    if (this.isActive()) {
      this.deactivate.emit();
    } else {
      this.activate.emit();
    }
  }
}
