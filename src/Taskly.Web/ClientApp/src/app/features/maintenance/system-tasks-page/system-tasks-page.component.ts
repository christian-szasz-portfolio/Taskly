import { CommonModule } from '@angular/common';
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { Observable } from 'rxjs';
import { Icons } from '../../../core/icons/icon-registry';
import type { SystemTask } from '../../../core/models/system-task.interfaces';
import { SystemTaskState } from '../../../core/models/system-task.interfaces';
import type { SystemTaskFilter } from '../models/maintenance.types';
import { DEFAULT_SYSTEM_TASK_FILTER } from '../models/maintenance.types';
import type { PagedResult } from '../models/maintenance.interfaces';
import { BaseMaintenancePageComponent } from '../base/base-maintenance-page.component';
import { MaintenancePageLayoutComponent } from '../components/maintenance-page-layout/maintenance-page-layout.component';
import { DatePickerInputComponent } from '../../../shared/components/date-picker/date-picker-input.component';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

@Component({
  selector: 'app-system-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
    MaintenancePageLayoutComponent,
    DatePickerInputComponent
  ],
  templateUrl: './system-tasks-page.component.html',
  styleUrl: './system-tasks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemTasksPageComponent extends BaseMaintenancePageComponent<SystemTask, SystemTaskFilter> {
  // =========================================================================
  // Entity-Specific Properties
  // =========================================================================

  protected readonly entityName = 'system tasks';

  public readonly icons = {
    ...this.baseIcons,
    header: Icons.clipboardList,
    finished: Icons.check,
    started: Icons.spinner,
    starting: Icons.play,
    cancelled: Icons.ban
  };

  public readonly stateOptions = [
    { value: undefined, label: 'All States' },
    { value: SystemTaskState.Starting, label: 'Starting' },
    { value: SystemTaskState.Started, label: 'Started' },
    { value: SystemTaskState.Finished, label: 'Finished' },
    { value: SystemTaskState.Cancelled, label: 'Cancelled' }
  ];

  // Entity-specific filter
  public readonly stateFilter = signal<SystemTaskState | undefined>(undefined);

  // Expose entities as 'tasks' for template compatibility
  public readonly tasks = this.entities;

  constructor() {
    super();

    EventBus.send(TITLE_EVENT_NAME, 'System Tasks');

    // Watch entity-specific filter for auto-refresh
    this.watchFilterSignal(this.stateFilter);
  }

  // =========================================================================
  // Abstract Method Implementations
  // =========================================================================

  protected getDefaultFilter(): SystemTaskFilter {
    return { ...DEFAULT_SYSTEM_TASK_FILTER };
  }

  protected buildFilter(): SystemTaskFilter {
    return {
      page: 1,
      pageSize: this.pageSize(),
      fromDate: this.fromDate() ? this.formatDateForApi(this.fromDate()!) : undefined,
      toDate: this.toDate() ? this.formatDateForApi(this.toDate()!) : undefined,
      state: this.stateFilter(),
      search: this.searchTerm().trim() || undefined
    };
  }

  protected hasEntitySpecificFilters(): boolean {
    return this.stateFilter() !== undefined;
  }

  protected resetEntitySpecificFilters(): void {
    this.stateFilter.set(undefined);
  }

  protected fetchFromApi(filter: SystemTaskFilter): Observable<PagedResult<SystemTask>> {
    return this.api.listSystemTasks(filter);
  }

  // =========================================================================
  // Entity-Specific Methods
  // =========================================================================

  public getStateIcon(state: SystemTaskState): typeof Icons.check {
    const icons: Record<SystemTaskState, typeof Icons.check> = {
      [SystemTaskState.Finished]: this.icons.finished,
      [SystemTaskState.Started]: this.icons.started,
      [SystemTaskState.Starting]: this.icons.starting,
      [SystemTaskState.Cancelled]: this.icons.cancelled
    };
    return icons[state] ?? this.icons.finished;
  }

  public getStateClass(state: SystemTaskState): string {
    const classes: Record<SystemTaskState, string> = {
      [SystemTaskState.Finished]: 'state--finished',
      [SystemTaskState.Started]: 'state--started',
      [SystemTaskState.Starting]: 'state--starting',
      [SystemTaskState.Cancelled]: 'state--cancelled'
    };
    return classes[state] ?? 'state--finished';
  }
}
