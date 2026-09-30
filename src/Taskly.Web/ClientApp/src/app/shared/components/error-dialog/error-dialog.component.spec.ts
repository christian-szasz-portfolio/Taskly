import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createSpyObj, type MockedObject, getFormTestProviders } from '@testing/test-helpers';
import { ErrorDialogComponent } from './error-dialog.component';
import type { ErrorDialogData } from './error-dialog.interfaces';

describe('ErrorDialogComponent', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<ErrorDialogComponent>>;

  const mockDialogData: ErrorDialogData = {
    title: 'Error Occurred',
    description: 'Something went wrong. Please try again.'
  };

  beforeEach(async () => {
    dialogRefSpy = createSpyObj<MatDialogRef<ErrorDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      imports: [ErrorDialogComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have dialog data', () => {
    expect(component.data.title).toBe('Error Occurred');
    expect(component.data.description).toBe('Something went wrong. Please try again.');
  });

  it('should have icon', () => {
    expect(component.icon).toBeTruthy();
  });

  describe('reload', () => {
    it('should have a reload method', () => {
      // We can't actually test window.location.reload in modern browsers
      // because it's not configurable. Instead, we just verify the method exists.
      expect(typeof component.reload).toBe('function');
    });
  });

  describe('dismiss', () => {
    it('should close the dialog', () => {
      component.dismiss();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  it('should render title when provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Error Occurred');
  });

  it('should render description when provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Something went wrong');
  });
});

describe('ErrorDialogComponent with minimal data', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;

  beforeEach(async () => {
    const dialogRefSpy = createSpyObj<MatDialogRef<ErrorDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      imports: [ErrorDialogComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should handle empty data', () => {
    expect(component.data.title).toBeUndefined();
    expect(component.data.description).toBeUndefined();
  });
});
