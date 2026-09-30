import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import { RouterModule } from '@angular/router';

export enum CatalogTheme {
  Indigo = 'indigo',
  Emerald = 'emerald',
  Amber = 'amber',
  Sky = 'sky',
}

@Component({
  selector: 'app-task-catalog-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, FontAwesomeModule, RouterModule],
  templateUrl: './task-catalog-page.component.html',
  styleUrl: './task-catalog-page.component.scss'
})
export class TaskCatalogPageComponent {
  public readonly eyebrow = input.required<string>();
  public readonly title = input.required<string>();
  public readonly description = input.required<string>();
  public readonly theme = input<CatalogTheme>(CatalogTheme.Indigo);
  public readonly isEmpty = input(false);
  public readonly emptyTitle = input('No items yet.');
  public readonly emptyHint = input('Create items from the kanban board to populate this view.');
  public readonly boardRoute = input<string[] | null>(null);

  public readonly refreshed = output<void>();

  public readonly refreshIcon = Icons.sync;
  public readonly boardIcon = Icons.kanban;

  public refresh(): void {
    this.refreshed.emit();
  }
}
