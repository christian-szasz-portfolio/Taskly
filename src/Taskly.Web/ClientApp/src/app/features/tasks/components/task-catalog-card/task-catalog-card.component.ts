import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons, type IconDefinition } from '../../../../core/icons/icon-registry';
import type { CardTheme } from '../../../../core/models/task.enums';

export { CardTheme } from '../../../../core/models/task.enums';

export interface CatalogCardAction {
  icon: IconDefinition;
  label: string;
  tooltip?: string;
  accent?: CardTheme;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Tooltip to show when action is disabled (overrides tooltip) */
  disabledTooltip?: string;
}

@Component({
  selector: 'app-task-catalog-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, FontAwesomeModule],
  templateUrl: './task-catalog-card.component.html',
  styleUrl: './task-catalog-card.component.scss'
})
export class TaskCatalogCardComponent {
  public readonly issueKey = input<string | null | undefined>(null);
  public readonly title = input.required<string>();
  public readonly primaryAction = input<CatalogCardAction | null>(null);

  public readonly opened = output<void>();
  public readonly primaryActionClicked = output<void>();

  public readonly linkIcon = Icons.externalLink;

  public open(event: Event): void {
    event.stopPropagation();
    this.opened.emit();
  }

  public handlePrimaryAction(event: Event): void {
    event.stopPropagation();
    this.primaryActionClicked.emit();
  }
}
