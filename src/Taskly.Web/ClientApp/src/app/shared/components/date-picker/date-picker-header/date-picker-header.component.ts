
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCalendar } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-date-picker-calendar-header',
  standalone: true,
  imports: [MatButtonModule, MatSelectModule, MatTooltipModule, FontAwesomeModule],
  templateUrl: './date-picker-header.component.html',
  styleUrl: '../date-picker-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerCalendarHeaderComponent {
  private readonly calendar = inject(MatCalendar<Date>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly calendarActiveDate = signal(new Date(this.calendar.activeDate));

  public readonly chevronLeft = signal(faChevronLeft);
  public readonly chevronRight = signal(faChevronRight);
  public readonly monthNames = signal(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  public readonly activeMonth = computed(() => this.calendarActiveDate().getMonth());
  public readonly activeYear = computed(() => this.calendarActiveDate().getFullYear());
  public readonly yearOptions = computed(() => {
    const start = this.activeYear() - 5;
    return Array.from({ length: 11 }, (_, index) => start + index);
  });

  constructor() {
    const sub = this.calendar.stateChanges.subscribe(() => {
      this.calendarActiveDate.set(new Date(this.calendar.activeDate));
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  public addMonths(offset: number): void {
    const newDate = new Date(this.activeYear(), this.activeMonth() + offset, 1);
    this.updateCalendar(newDate);
  }

  public setMonth(month: number): void {
    const newDate = new Date(this.activeYear(), month, 1);
    this.updateCalendar(newDate);
  }

  public setYear(year: number): void {
    const newDate = new Date(year, this.activeMonth(), 1);
    this.updateCalendar(newDate);
  }

  private updateCalendar(date: Date): void {
    this.calendar.activeDate = date;
    this.calendar.stateChanges.next();
    this.calendarActiveDate.set(new Date(date));
  }
}
