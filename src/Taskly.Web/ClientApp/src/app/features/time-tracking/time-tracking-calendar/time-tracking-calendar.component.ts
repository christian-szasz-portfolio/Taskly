import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { AuthStore } from '../../../core/state/auth.store';
import { FullCalendarModule, type FullCalendarComponent } from '@fullcalendar/angular';
import type { CalendarOptions, EventClickArg, EventDropArg, EventInput, DatesSetArg, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type EventResizeDoneArg } from '@fullcalendar/interaction';
import { TimeEntryStore } from '../../../core/state/time-entry.store';
import type { TimeEntry, UpdateTimeEntryPayload } from '../../../core/models/time-tracking.interfaces';
import { TimeEntryEditorDialogComponent, type TimeEntryEditorDialogData, type TimeEntryEditorDialogResult } from '../time-entry-editor-dialog/time-entry-editor-dialog.component';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

@Component({
  selector: 'app-time-tracking-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FontAwesomeModule,
    FullCalendarModule
  ],
  templateUrl: './time-tracking-calendar.component.html',
  styleUrl: './time-tracking-calendar.component.scss'
})
export class TimeTrackingCalendarComponent {
  private readonly store = inject(TimeEntryStore);
  private readonly dialog = inject(MatDialog);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly calendarRef = viewChild<FullCalendarComponent>('calendar');
  private readonly authStore = inject(AuthStore);

  // Icons
  public readonly prevIcon = Icons.chevronLeft;
  public readonly nextIcon = Icons.chevronRight;
  public readonly addIcon = Icons.plus;
  public readonly dayIcon = Icons.calendarDay;
  public readonly weekIcon = Icons.calendarWeek;
  public readonly monthIcon = Icons.calendar;

  // View state
  public readonly currentView = signal<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>('timeGridWeek');
  public readonly currentTitle = signal<string>('');

  // Store state
  public readonly vm = this.store.vm;
  public readonly totalDuration = this.store.totalDurationFormatted;
  public readonly loading = computed(() => this.vm().loading);
  public readonly saving = computed(() => this.vm().saving);

  public readonly canWrite = computed(() => this.authStore.canWrite());
  /** The demo can edit existing entries but cannot create or delete them. */
  public readonly addEntryDisabledNote = 'The demo does not allow creating time entries';

  // Calendar events computed from store entries
  public readonly calendarEvents = computed<EventInput[]>(() => {
    const entries = this.vm().entries;
    return entries.map((entry) => this.mapTimeEntryToEvent(entry));
  });

  // Calendar options
  public readonly calendarOptions = computed<CalendarOptions>(() => {
    const canWrite = this.canWrite();
    return {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      headerToolbar: false, // We'll use our own toolbar
      height: '100%',
      nowIndicator: true,
      allDaySlot: true,
      allDayText: 'All Day',
      slotMinTime: '00:00:00',
      slotMaxTime: '24:00:00',
      slotDuration: '00:30:00',
      slotLabelInterval: '01:00:00',
      weekends: true,
      editable: canWrite,
      selectable: false,
      dayMaxEvents: true,
      eventOverlap: false,
      firstDay: 1, // Week starts on Monday
      scrollTime: '08:00:00',
      events: [],
      eventClick: (arg: EventClickArg) => this.handleEventClick(arg),
      eventDidMount: (arg: EventMountArg) => this.decorateEvent(arg),
      eventDrop: canWrite ? (arg: EventDropArg) => this.handleEventDrop(arg) : undefined,
      eventResize: canWrite ? (arg: EventResizeDoneArg) => this.handleEventResize(arg) : undefined,
      datesSet: (arg: DatesSetArg) => this.handleDatesSet(arg)
    };
  });

  constructor() {
    EventBus.send(TITLE_EVENT_NAME, 'Temporal');

    // Update calendar events when store entries change
    effect(() => {
      const events = this.calendarEvents();
      const calendar = this.calendarRef();
      if (calendar) {
        const api = calendar.getApi();
        // Remove all events and re-add (api may be null during initialization)
        if (api) {
          api.removeAllEvents();
          events.forEach((event) => api.addEvent(event));
        }
      }
    });
  }

  // ========== Navigation Methods ==========

  public navigatePrev(): void {
    const calendar = this.calendarRef();
    if (calendar) {
      calendar.getApi().prev();
    }
  }

  public navigateNext(): void {
    const calendar = this.calendarRef();
    if (calendar) {
      calendar.getApi().next();
    }
  }

  public navigateToday(): void {
    const calendar = this.calendarRef();
    if (calendar) {
      calendar.getApi().today();
    }
  }

  public setView(view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'): void {
    const calendar = this.calendarRef();
    if (calendar) {
      calendar.getApi().changeView(view);
      this.currentView.set(view);
    }
  }

  // ========== Event Handlers ==========

  public handleDatesSet(arg: DatesSetArg): void {
    // Update title
    this.currentTitle.set(arg.view.title);
    this.currentView.set(arg.view.type as 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth');

    // Load entries for the visible date range
    const startDate = arg.start.toISOString();
    const endDate = arg.end.toISOString();
    this.store.load(startDate, endDate);
  }

  public handleEventClick(clickInfo: EventClickArg): void {
    // In read-only mode, don't allow editing entries
    if (!this.isBrowser || !this.canWrite()) {
      return;
    }

    const entryId = clickInfo.event.id;
    const entry = this.store.getById(entryId);

    if (!entry) {
      return;
    }

    const dialogData: TimeEntryEditorDialogData = { entry };

    const dialogRef = this.dialog.open(TimeEntryEditorDialogComponent, {
      width: '500px',
      data: dialogData,
      autoFocus: 'first-tabbable'
    });

    dialogRef.afterClosed().subscribe((result: TimeEntryEditorDialogResult | undefined) => {
      if (result) {
        const payload: UpdateTimeEntryPayload = { ...result };
        this.store.update(entryId, payload);
      }
    });
  }

  public handleEventDrop(dropInfo: EventDropArg): void {
    const entryId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end ?? dropInfo.event.start;

    if (!newStart) {
      dropInfo.revert();
      return;
    }

    const payload: UpdateTimeEntryPayload = {
      startTimeUtc: newStart.toISOString(),
      endTimeUtc: newEnd?.toISOString() ?? newStart.toISOString(),
      isAllDay: dropInfo.event.allDay
    };

    this.store.update(entryId, payload);
  }

  public handleEventResize(resizeInfo: EventResizeDoneArg): void {
    const entryId = resizeInfo.event.id;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end ?? resizeInfo.event.start;

    if (!newStart || !newEnd) {
      resizeInfo.revert();
      return;
    }

    const payload: UpdateTimeEntryPayload = {
      startTimeUtc: newStart.toISOString(),
      endTimeUtc: newEnd.toISOString()
    };

    this.store.update(entryId, payload);
  }

  // ========== Helper Methods ==========

  /**
   * Event blocks truncate their title to a single line, so the full text has to stay reachable
   * without opening the editor: a native tooltip carries the title and, when there is one, the
   * description. Also gives the block an accessible name, which an empty div had no way to.
   */
  private decorateEvent(arg: EventMountArg): void {
    const description = arg.event.extendedProps['description'] as string | undefined;
    const title = arg.event.title;
    arg.el.title = description ? `${title}\n${description}` : title;
    arg.el.setAttribute('aria-label', title);
  }

  private mapTimeEntryToEvent(entry: TimeEntry): EventInput {
    const hasLinkedTask = !!entry.taskKey;
    const displayTitle = entry.taskTitle ?? entry.taskKey ?? 'Time Entry';
    const title = hasLinkedTask ? `[${entry.taskKey}] ${displayTitle}` : displayTitle;

    return {
      id: entry.id,
      title,
      start: entry.startTimeUtc,
      end: entry.endTimeUtc,
      allDay: entry.isAllDay,
      backgroundColor: hasLinkedTask ? '#3b82f6' : '#10b981', // Blue for linked, green for standalone
      borderColor: hasLinkedTask ? '#2563eb' : '#059669',
      textColor: '#ffffff',
      extendedProps: {
        description: entry.description,
        taskItemId: entry.taskItemId,
        subtaskId: entry.subtaskId,
        taskTitle: entry.taskTitle,
        durationMinutes: entry.durationMinutes
      }
    };
  }
}
