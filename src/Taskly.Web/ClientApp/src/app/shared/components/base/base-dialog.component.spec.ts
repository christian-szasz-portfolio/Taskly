import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { BaseDialogComponent } from './base-dialog.component';

// Concrete implementation for testing
@Component({
  selector: 'app-test-dialog',
  template: '',
  standalone: true
})
class TestDialogComponent extends BaseDialogComponent<{ title: string }, string> {
  public readonly dialogTitle = 'Test Dialog';

  public submitAndClose(): void {
    this.closeWithResult('success');
  }
}

describe('BaseDialogComponent', () => {
  let component: TestDialogComponent;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown, string>>;

  beforeEach(() => {
    dialogRefSpy = createSpyObj<MatDialogRef<unknown, string>>(['close']);

    TestBed.configureTestingModule({
      imports: [TestDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Test Data' } },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    const fixture = TestBed.createComponent(TestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have injected dialog data', () => {
    expect(component.data).toEqual({ title: 'Test Data' });
  });

  it('should have abstract dialogTitle implemented', () => {
    expect(component.dialogTitle).toBe('Test Dialog');
  });

  describe('handleCancel', () => {
    it('should close dialog without result', () => {
      component.handleCancel();

      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('closeWithResult', () => {
    it('should close dialog with result', () => {
      component.submitAndClose();

      expect(dialogRefSpy.close).toHaveBeenCalledWith('success');
    });
  });
});

// Test dynamic dialog title
@Component({
  selector: 'app-dynamic-title-dialog',
  template: '',
  standalone: true
})
class DynamicTitleDialogComponent extends BaseDialogComponent<{ mode: 'create' | 'edit' }, void> {
  public get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Create Item' : 'Edit Item';
  }
}

describe('BaseDialogComponent with dynamic title', () => {
  it('should support dynamic dialog title', () => {
    const dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['close']);

    TestBed.configureTestingModule({
      imports: [DynamicTitleDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    const fixture = TestBed.createComponent(DynamicTitleDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.dialogTitle).toBe('Create Item');
  });

  it('should return Edit title for edit mode', () => {
    const dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['close']);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DynamicTitleDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'edit' } },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    const fixture = TestBed.createComponent(DynamicTitleDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.dialogTitle).toBe('Edit Item');
  });
});
