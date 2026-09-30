import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

/**
 * Skeleton loader variant types for different UI contexts.
 */
export type SkeletonVariant =
  | 'text'
  | 'text-block'
  | 'title'
  | 'avatar'
  | 'card'
  | 'table-row'
  | 'table'
  | 'kanban-card'
  | 'kanban-column'
  | 'detail-page'
  | 'form'
  | 'list-item';

/**
 * Reusable skeleton loader component for displaying placeholder content while loading.
 *
 * Supports multiple variants for different UI contexts:
 * - 'text': Single line of text (default)
 * - 'text-block': Multiple lines of text
 * - 'title': Page title placeholder
 * - 'avatar': Circular avatar placeholder
 * - 'card': Generic card placeholder
 * - 'table-row': Single table row
 * - 'table': Full table with rows
 * - 'kanban-card': Kanban board card placeholder
 * - 'kanban-column': Full kanban column with multiple cards
 * - 'detail-page': Detail page layout skeleton
 * - 'form': Form with multiple fields
 * - 'list-item': List item with icon and text
 *
 * @example Basic text skeleton
 * ```html
 * <app-skeleton-loader />
 * ```
 *
 * @example Table skeleton with 5 rows
 * ```html
 * <app-skeleton-loader variant="table" [rows]="5" />
 * ```
 *
 * @example Custom width and height
 * ```html
 * <app-skeleton-loader [width]="'200px'" [height]="'40px'" />
 * ```
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent {
  /** Skeleton variant type */
  public readonly variant = input<SkeletonVariant>('text');

  /** Custom width (CSS value) */
  public readonly width = input<string | null>(null);

  /** Custom height (CSS value) */
  public readonly height = input<string | null>(null);

  /** Number of rows for table/text-block variants */
  public readonly rows = input<number>(5);

  /** Number of columns for table variant */
  public readonly columns = input<number>(5);

  /** Number of lines for text-block variant */
  public readonly lines = input<number>(3);

  /** Number of cards for kanban-column variant */
  public readonly cards = input<number>(3);

  /** Whether to show animation */
  public readonly animated = input<boolean>(true);

  /** Border radius (CSS value) */
  public readonly borderRadius = input<string>('4px');

  /** Additional CSS class for the container */
  public readonly containerClass = input<string>('');

  /** Array of line indices for text-block iteration */
  public readonly lineIndices = computed(() =>
    Array.from({ length: this.lines() }, (_, i) => i)
  );

  /** Array of row indices for table iteration */
  public readonly rowIndices = computed(() =>
    Array.from({ length: this.rows() }, (_, i) => i)
  );

  /** Array of column indices for table iteration */
  public readonly columnIndices = computed(() =>
    Array.from({ length: this.columns() }, (_, i) => i)
  );

  /** Array of card indices for kanban-column iteration */
  public readonly cardIndices = computed(() =>
    Array.from({ length: this.cards() }, (_, i) => i)
  );

  /** Computed custom styles */
  public readonly customStyles = computed(() => {
    const styles: Record<string, string> = {};
    if (this.width()) {
      styles['width'] = this.width()!;
    }
    if (this.height()) {
      styles['height'] = this.height()!;
    }
    if (this.borderRadius()) {
      styles['border-radius'] = this.borderRadius();
    }
    return styles;
  });

  /** Get random width for varying line lengths */
  public getLineWidth(index: number): string {
    const widths = ['100%', '85%', '70%', '92%', '60%', '78%', '95%', '55%'];
    return widths[index % widths.length];
  }
}
