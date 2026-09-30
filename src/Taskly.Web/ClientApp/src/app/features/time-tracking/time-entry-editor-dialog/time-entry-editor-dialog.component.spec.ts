import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { getDialogTestProviders, createSpyObj, type MockedObject } from '@testing/test-helpers';
import { TimeEntryEditorDialogComponent, type TimeEntryEditorDialogResult } from './time-entry-editor-dialog.component';
import type { TimeEntry } from '../../../core/models/time-tracking.interfaces';

describe('TimeEntryEditorDialogComponent', () => {
  let component: TimeEntryEditorDialogComponent;
  let fixture: ComponentFixture<TimeEntryEditorDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<TimeEntryEditorDialogComponent>>;

  const createMockTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
    id: 'te-1',
    description: 'Existing description',
    startTimeUtc: '2026-01-18T09:00:00Z',
    endTimeUtc: '2026-01-18T10:30:00Z',
    durationMinutes: 90,
    isAllDay: false,
    userId: 'user-1',
    taskItemId: 'wf-1',
    subtaskId: null,
    taskKey: 'DEMO-101',
    taskTitle: 'Existing Task',
    createdAtUtc: '2026-01-18T08:00:00Z',
    updatedAtUtc: null,
    ...overrides
  });

  const setupTestBed = async (entry: TimeEntry = createMockTimeEntry()) => {
    dialogRefSpy = createSpyObj<MatDialogRef<TimeEntryEditorDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      imports: [TimeEntryEditorDialogComponent],
      providers: [
        ...getDialogTestProviders(),
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { entry } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeEntryEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const lastResult = (): TimeEntryEditorDialogResult =>
    dialogRefSpy.close.mock.calls.at(-1)?.[0] as TimeEntryEditorDialogResult;

  describe('an existing entry', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('is titled for editing', () => {
      expect(component.dialogTitle).toBe('Edit Time Entry');
    });

    it('should populate taskKeyInput from entry', () => {
      expect(component.taskKeyInput()).toBe('DEMO-101');
    });

    it('should populate description from entry', () => {
      expect(component.description()).toBe('Existing description');
    });

    it('should be valid with existing entry data', () => {
      expect(component.isValid).toBe(true);
    });

    it('should have icons defined', () => {
      expect(component.clockIcon).toBeDefined();
      expect(component.clearIcon).toBeDefined();
    });

    it('offers no delete: the demo keeps every entry', () => {
      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).not.toContain('Delete');
    });
  });

  describe('all day entries', () => {
    beforeEach(async () => {
      await setupTestBed(createMockTimeEntry({ isAllDay: true }));
    });

    it('should initialize isAllDay from the entry', () => {
      expect(component.isAllDay()).toBe(true);
    });

    it('should set time to full day when all day is enabled', () => {
      component.onAllDayChange(true);
      expect(component.startTime()).toBe('00:00');
      expect(component.endTime()).toBe('23:59');
    });
  });

  describe('work item key', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should allow clearing the key', () => {
      component.clearTaskLink();
      expect(component.taskKeyInput()).toBe('');
    });

    it('should be invalid without a key', () => {
      component.taskKeyInput.set('');
      expect(component.isValid).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should not submit if invalid', () => {
      component.taskKeyInput.set('');
      component.handleSubmit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close dialog with the edited entry', () => {
      component.taskKeyInput.set('DEMO-102');
      component.description.set('Description');

      component.handleSubmit();

      expect(dialogRefSpy.close).toHaveBeenCalled();
      expect(lastResult().taskKey).toBe('DEMO-102');
      expect(lastResult().description).toBe('Description');
    });

    it('should trim taskKey and description', () => {
      component.taskKeyInput.set('  DEMO-101  ');
      component.description.set('  Trimmed Description  ');

      component.handleSubmit();

      expect(lastResult().taskKey).toBe('DEMO-101');
      expect(lastResult().description).toBe('Trimmed Description');
    });

    it('should set empty description to null', () => {
      component.description.set('   ');

      component.handleSubmit();

      expect(lastResult().description).toBeNull();
    });
  });

  describe('handleCancel', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should close dialog without result', () => {
      component.handleCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('date/time validation', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should be invalid if end time is before start time', () => {
      component.startDate.set('2026-01-18');
      component.startTime.set('14:00');
      component.endDate.set('2026-01-18');
      component.endTime.set('10:00');

      expect(component.isValid).toBe(false);
    });

    it('should be valid if end time is after start time', () => {
      component.startDate.set('2026-01-18');
      component.startTime.set('09:00');
      component.endDate.set('2026-01-18');
      component.endTime.set('10:00');

      expect(component.isValid).toBe(true);
    });

    it('should be valid if end date is after start date', () => {
      component.startDate.set('2026-01-18');
      component.startTime.set('09:00');
      component.endDate.set('2026-01-19');
      component.endTime.set('09:00');

      expect(component.isValid).toBe(true);
    });
  });
});
