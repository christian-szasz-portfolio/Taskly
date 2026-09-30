import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFormTestProviders, createSpyObj, type MockedObject } from '@testing/test-helpers';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogResult } from './confirm-dialog.enums';
import type { ConfirmDialogData } from './confirm-dialog.interfaces';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<ConfirmDialogComponent>>;

  const mockDialogData: ConfirmDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?'
  };

  beforeEach(async () => {
    dialogRefSpy = createSpyObj<MatDialogRef<ConfirmDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have dialog data', () => {
    expect(component.data.title).toBe('Confirm Action');
    expect(component.data.message).toBe('Are you sure you want to proceed?');
  });

  it('should have icon signal', () => {
    expect(component.icon()).toBeTruthy();
  });

  describe('close', () => {
    it('should close dialog with true when confirmed', () => {
      component.close(true);
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog with false when cancelled', () => {
      component.close(false);
      expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });
  });

  describe('confirmLabel', () => {
    it('should return custom label when provided', async () => {
      const customData: ConfirmDialogData = {
        ...mockDialogData,
        confirmLabel: 'Yes, Delete'
      };

      await TestBed.resetTestingModule().configureTestingModule({
        imports: [ConfirmDialogComponent],
        providers: [
          ...getFormTestProviders(),
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: customData }
        ]
      }).compileComponents();

      const customFixture = TestBed.createComponent(ConfirmDialogComponent);
      const customComponent = customFixture.componentInstance;

      expect(customComponent.confirmLabel()).toBe('Yes, Delete');
    });

    it('should return default label when not provided', () => {
      expect(component.confirmLabel()).toBe(ConfirmDialogResult.Confirm);
    });
  });

  describe('cancelLabel', () => {
    it('should return custom label when provided', async () => {
      const customData: ConfirmDialogData = {
        ...mockDialogData,
        cancelLabel: 'No, Keep'
      };

      await TestBed.resetTestingModule().configureTestingModule({
        imports: [ConfirmDialogComponent],
        providers: [
          ...getFormTestProviders(),
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: customData }
        ]
      }).compileComponents();

      const customFixture = TestBed.createComponent(ConfirmDialogComponent);
      const customComponent = customFixture.componentInstance;

      expect(customComponent.cancelLabel()).toBe('No, Keep');
    });

    it('should return default label when not provided', () => {
      expect(component.cancelLabel()).toBe(ConfirmDialogResult.Cancel);
    });
  });
});
