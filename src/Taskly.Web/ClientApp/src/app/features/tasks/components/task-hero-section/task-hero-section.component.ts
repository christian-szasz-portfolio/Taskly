import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { TaskStatusStats } from '../status-chart/task-status-chart.component';
import { TaskStatusChartComponent } from '../status-chart/task-status-chart.component';
import type { TaskHeroCard, TaskHeroIcons } from '../../models/task-board.models';
import { Icons } from '../../../../core/icons/icon-registry';

@Component({
  selector: 'app-task-hero-section',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, FontAwesomeModule, TaskStatusChartComponent],
  templateUrl: './task-hero-section.component.html',
  styleUrl: './task-hero-section.component.scss'
})
export class TaskHeroSectionComponent {
  public readonly cards = input.required<readonly TaskHeroCard[]>();
  public readonly stats = input.required<TaskStatusStats>();
  public readonly heroIcons = input.required<TaskHeroIcons>();
  /** Why the create button is disabled */
  public readonly createDisabledNote = 'The demo does not allow creating items.';
  public readonly collapsed = signal(false);
  public readonly collapseLabel = computed(() => (this.collapsed() ? 'Expand summary' : 'Collapse summary'));
  public readonly collapseIcons = {
    expanded: Icons.chevronUp,
    collapsed: Icons.chevronDown
  };

  public readonly refresh = output<void>();

  public toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }
}
