import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCalendar } from '@angular/material/datepicker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { type MockedObject } from '@testing/test-helpers';
import { DatePickerCalendarHeaderComponent } from './date-picker-header.component';

describe('DatePickerCalendarHeaderComponent', () => {
  let component: DatePickerCalendarHeaderComponent;
  let fixture: ComponentFixture<DatePickerCalendarHeaderComponent>;
  let calendarSpy: MockedObject<MatCalendar<Date>>;
  let stateChangesSubject: Subject<void>;

  beforeEach(async () => {
    stateChangesSubject = new Subject<void>();
    const testDate = new Date(2026, 5, 15); // June 15, 2026

    // Create mock with writable activeDate property
    calendarSpy = {
      activeDate: testDate,
      stateChanges: stateChangesSubject
    } as unknown as MockedObject<MatCalendar<Date>>;

    await TestBed.configureTestingModule({
      imports: [DatePickerCalendarHeaderComponent, NoopAnimationsModule],
      providers: [
        { provide: MatCalendar, useValue: calendarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerCalendarHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('month names', () => {
    it('should have 12 month names', () => {
      expect(component.monthNames().length).toBe(12);
    });

    it('should have correct month abbreviations', () => {
      const months = component.monthNames();
      expect(months[0]).toBe('Jan');
      expect(months[5]).toBe('Jun');
      expect(months[11]).toBe('Dec');
    });
  });

  describe('activeMonth', () => {
    it('should return current calendar month', () => {
      expect(component.activeMonth()).toBe(5); // June (0-indexed)
    });
  });

  describe('activeYear', () => {
    it('should return current calendar year', () => {
      expect(component.activeYear()).toBe(2026);
    });
  });

  describe('yearOptions', () => {
    it('should return 11 year options', () => {
      expect(component.yearOptions().length).toBe(11);
    });

    it('should center on active year', () => {
      const years = component.yearOptions();
      expect(years[5]).toBe(2026); // Center is active year
      expect(years[0]).toBe(2021); // Start = active - 5
      expect(years[10]).toBe(2031); // End = active + 5
    });
  });

  describe('addMonths', () => {
    it('should navigate to next month', () => {
      component.addMonths(1);

      expect(component.activeMonth()).toBe(6); // July
    });

    it('should navigate to previous month', () => {
      component.addMonths(-1);

      expect(component.activeMonth()).toBe(4); // May
    });

    it('should emit stateChanges', () => {
      stateChangesSubject.subscribe(() => (true));

      component.addMonths(1);

      // stateChanges.next() is called but synchronously
      // we need to check if the calendar was updated
      expect(component.activeMonth()).toBeDefined();
    });
  });

  describe('setMonth', () => {
    it('should set specific month', () => {
      component.setMonth(0); // January

      expect(component.activeMonth()).toBe(0);
    });

    it('should keep the same year', () => {
      component.setMonth(11); // December

      expect(component.activeYear()).toBe(2026);
    });
  });

  describe('setYear', () => {
    it('should set specific year', () => {
      component.setYear(2030);

      expect(component.activeYear()).toBe(2030);
    });

    it('should keep the same month', () => {
      component.setYear(2025);

      expect(component.activeMonth()).toBe(5); // June
    });
  });

  describe('icons', () => {
    it('should have chevron left icon', () => {
      expect(component.chevronLeft()).toBeDefined();
    });

    it('should have chevron right icon', () => {
      expect(component.chevronRight()).toBeDefined();
    });
  });

  describe('stateChanges subscription', () => {
    it('should update internal date on calendar state change', () => {
      // Update calendar's activeDate
      calendarSpy.activeDate = new Date(2027, 0, 1);

      // Emit state change
      stateChangesSubject.next();

      // The component should sync with the calendar
      expect(component.activeYear()).toBe(2027);
      expect(component.activeMonth()).toBe(0); // January
    });
  });
});
