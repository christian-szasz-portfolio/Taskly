import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';

export interface PageChangeEvent {
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-simple-paginator',
  standalone: true,
  imports: [MatButtonModule, FontAwesomeModule],
  template: `
    <div class="paginator">
      <span class="paginator__info">
        {{ rangeLabel() }}
      </span>
      <div class="paginator__controls">
        <button
          mat-icon-button
          type="button"
          [disabled]="!hasPreviousPage()"
          (click)="previousPage()"
          aria-label="Previous page"
        >
          <fa-icon [icon]="icons.prev"></fa-icon>
        </button>
        <button
          mat-icon-button
          type="button"
          [disabled]="!hasNextPage()"
          (click)="nextPage()"
          aria-label="Next page"
        >
          <fa-icon [icon]="icons.next"></fa-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .paginator {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--border-subtle);
      margin-top: auto;
    }

    .paginator__info {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .paginator__controls {
      display: flex;
      gap: 0.25rem;
    }

    .paginator__controls button {
      width: 32px;
      height: 32px;
    }

    .paginator__controls fa-icon {
      font-size: 0.75rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimplePaginatorComponent {
  public readonly pageIndex = input(0);
  public readonly pageSize = input(10);
  public readonly totalItems = input(0);
  public readonly pageChange = output<PageChangeEvent>();

  public readonly icons = {
    prev: Icons.chevronLeft,
    next: Icons.chevronRight
  };

  public readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.pageSize())
  );

  public readonly hasPreviousPage = computed(() => this.pageIndex() > 0);

  public readonly hasNextPage = computed(() =>
    this.pageIndex() < this.totalPages() - 1
  );

  public readonly rangeLabel = computed(() => {
    const total = this.totalItems();
    if (total === 0) {
      return 'No items';
    }
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min((this.pageIndex() + 1) * this.pageSize(), total);
    return `${start}–${end} of ${total}`;
  });

  public previousPage(): void {
    if (this.hasPreviousPage()) {
      this.pageChange.emit({
        pageIndex: this.pageIndex() - 1,
        pageSize: this.pageSize()
      });
    }
  }

  public nextPage(): void {
    if (this.hasNextPage()) {
      this.pageChange.emit({
        pageIndex: this.pageIndex() + 1,
        pageSize: this.pageSize()
      });
    }
  }
}
