import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { AboutDialogComponent } from './about-dialog.component';
import { AuthStore } from '../../../core/state/auth.store';

describe('AboutDialogComponent', () => {
  let component: AboutDialogComponent;
  let fixture: ComponentFixture<AboutDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;

  const render = async (trialExpiresAt: string | null): Promise<void> => {
    dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['close']);

    const authStoreSpy = createSpyObj<AuthStore>(
      [],
      {
        fullName: signal('Demo User').asReadonly(),
        email: signal('you@taskly.demo').asReadonly(),
        trialExpiresAt: signal<string | null>(trialExpiresAt).asReadonly()
      }
    );

    await TestBed.configureTestingModule({
      imports: [AboutDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: AuthStore, useValue: authStoreSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('during a trial', () => {
    beforeEach(async () => {
      await render('2026-02-01T12:00:00Z');
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have About as dialog title', () => {
      expect(component.dialogTitle).toBe('About');
    });

    it('should expose current year', () => {
      expect(component.currentYear()).toBe(new Date().getFullYear());
    });

    it('should expose the demo identity from the auth store', () => {
      expect(component.fullName()).toBe('Demo User');
      expect(component.email()).toBe('you@taskly.demo');
    });

    it('shows when the trial expires', () => {
      expect(component.formattedTrialExpiry()).toBe('February 1, 2026');
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Trial Expires');
    });

    it('shows no account details the demo does not have', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).not.toContain('Roles');
      expect(text).not.toContain('License');
    });

    it('should close dialog', () => {
      component.close();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should have icons defined', () => {
      expect(component.icons.about).toBeDefined();
      expect(component.icons.email).toBeDefined();
      expect(component.icons.user).toBeDefined();
      expect(component.icons.calendar).toBeDefined();
    });
  });

  describe('without a trial', () => {
    beforeEach(async () => {
      await render(null);
    });

    it('should return null when no trial expiry', () => {
      expect(component.formattedTrialExpiry()).toBeNull();
    });
  });
});
