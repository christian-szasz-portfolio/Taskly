import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getFormTestProviders } from '@testing/test-helpers';
import { FormActionsComponent } from './form-actions.component';

describe('FormActionsComponent', () => {
  let component: FormActionsComponent;
  let fixture: ComponentFixture<FormActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormActionsComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(FormActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      expect(component.dialogMode()).toBeFalse();
      expect(component.align()).toBe('end');
      expect(component.showDelete()).toBeFalse();
      expect(component.showCancel()).toBeTrue();
      expect(component.saving()).toBeFalse();
      expect(component.disabled()).toBeFalse();
      expect(component.submitLabel()).toBe('Submit');
      expect(component.cancelLabel()).toBe('Cancel');
      expect(component.savingLabel()).toBe('Saving...');
    });
  });

  describe('standalone mode (non-dialog)', () => {
    it('should render form-actions div when dialogMode is false', () => {
      const formActions = fixture.debugElement.query(By.css('.form-actions'));
      const dialogActions = fixture.debugElement.query(By.css('mat-dialog-actions'));

      expect(formActions).toBeTruthy();
      expect(dialogActions).toBeNull();
    });

    it('should apply correct alignment class', async () => {
      fixture.componentRef.setInput('align', 'center');
      fixture.detectChanges();
      await fixture.whenStable();

      const formActions = fixture.debugElement.query(By.css('.form-actions'));
      expect(formActions.classes['align-center']).toBeTrue();
    });
  });

  describe('dialog mode', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('dialogMode', true);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should render mat-dialog-actions when dialogMode is true', () => {
      const dialogActions = fixture.debugElement.query(By.css('mat-dialog-actions'));
      expect(dialogActions).toBeTruthy();
    });
  });

  describe('delete button', () => {
    it('should not show delete button by default', () => {
      const deleteBtn = fixture.debugElement.query(By.css('.delete-btn'));
      expect(deleteBtn).toBeNull();
    });

    it('should show delete button when showDelete is true', async () => {
      fixture.componentRef.setInput('showDelete', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const deleteBtn = fixture.debugElement.query(By.css('.delete-btn'));
      expect(deleteBtn).toBeTruthy();
    });

    it('should display custom delete label', async () => {
      fixture.componentRef.setInput('showDelete', true);
      fixture.componentRef.setInput('deleteLabel', 'Remove');
      fixture.detectChanges();
      await fixture.whenStable();

      const deleteBtn = fixture.debugElement.query(By.css('.delete-btn'));
      expect((deleteBtn.nativeElement as HTMLElement).textContent).toContain('Remove');
    });

    it('should emit deleteClick when delete button is clicked', async () => {
      fixture.componentRef.setInput('showDelete', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const deleteSpy = spyOn(component.deleteClick, 'emit');
      const deleteBtn = fixture.debugElement.query(By.css('.delete-btn'));
      (deleteBtn.nativeElement as HTMLElement).click();

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should disable delete button when saving', async () => {
      fixture.componentRef.setInput('showDelete', true);
      fixture.componentRef.setInput('saving', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const deleteBtn = fixture.debugElement.query(By.css('.delete-btn'));
      expect((deleteBtn.nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });
  });

  describe('cancel button', () => {
    it('should show cancel button by default', () => {
      const cancelBtn = fixture.debugElement.queryAll(By.css('button'))
        .find(btn => (btn.nativeElement as HTMLElement).textContent?.includes('Cancel'));
      expect(cancelBtn).toBeTruthy();
    });

    it('should hide cancel button when showCancel is false', async () => {
      fixture.componentRef.setInput('showCancel', false);
      fixture.detectChanges();
      await fixture.whenStable();

      const cancelBtn = fixture.debugElement.queryAll(By.css('button'))
        .find(btn => (btn.nativeElement as HTMLElement).textContent?.includes('Cancel'));
      expect(cancelBtn).toBeUndefined();
    });

    it('should display custom cancel label', async () => {
      fixture.componentRef.setInput('cancelLabel', 'Discard');
      fixture.detectChanges();
      await fixture.whenStable();

      const cancelBtn = fixture.debugElement.queryAll(By.css('button'))
        .find(btn => (btn.nativeElement as HTMLElement).textContent?.includes('Discard'));
      expect(cancelBtn).toBeTruthy();
    });

    it('should emit cancelClick when cancel button is clicked', () => {
      const cancelSpy = spyOn(component.cancelClick, 'emit');
      const cancelBtn = fixture.debugElement.queryAll(By.css('button'))
        .find(btn => (btn.nativeElement as HTMLElement).textContent?.includes('Cancel'));

      (cancelBtn!.nativeElement as HTMLElement).click();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should disable cancel button when saving', async () => {
      fixture.componentRef.setInput('saving', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const cancelBtn = fixture.debugElement.queryAll(By.css('button'))
        .find(btn => (btn.nativeElement as HTMLElement).textContent?.includes('Cancel'));
      expect((cancelBtn!.nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });
  });

  describe('submit button', () => {
    it('should display submit label', () => {
      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect((submitBtn.nativeElement as HTMLElement).textContent).toContain('Submit');
    });

    it('should display custom submit label', async () => {
      fixture.componentRef.setInput('submitLabel', 'Save Changes');
      fixture.detectChanges();
      await fixture.whenStable();

      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect((submitBtn.nativeElement as HTMLElement).textContent).toContain('Save Changes');
    });

    it('should display saving label when saving', async () => {
      fixture.componentRef.setInput('saving', true);
      fixture.componentRef.setInput('savingLabel', 'Processing...');
      fixture.detectChanges();
      await fixture.whenStable();

      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect((submitBtn.nativeElement as HTMLElement).textContent).toContain('Processing...');
    });

    it('should show spinner when saving', async () => {
      fixture.componentRef.setInput('saving', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should emit submitClick when submit button is clicked', () => {
      const submitSpy = spyOn(component.submitClick, 'emit');
      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));

      (submitBtn.nativeElement as HTMLElement).click();
      expect(submitSpy).toHaveBeenCalled();
    });

    it('should be disabled when saving', async () => {
      fixture.componentRef.setInput('saving', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect((submitBtn.nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });

    it('should be disabled when disabled input is true', async () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect((submitBtn.nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });

    it('should have type="submit" when submitType is submit', async () => {
      fixture.componentRef.setInput('submitType', 'submit');
      fixture.detectChanges();
      await fixture.whenStable();

      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect((submitBtn.nativeElement as HTMLButtonElement).type).toBe('submit');
    });
  });

  describe('isSubmitDisabled', () => {
    it('should return false when not saving and not disabled', () => {
      expect(component.isSubmitDisabled).toBeFalse();
    });

    it('should return true when saving', async () => {
      fixture.componentRef.setInput('saving', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should return true when disabled', async () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isSubmitDisabled).toBeTrue();
    });
  });
});
