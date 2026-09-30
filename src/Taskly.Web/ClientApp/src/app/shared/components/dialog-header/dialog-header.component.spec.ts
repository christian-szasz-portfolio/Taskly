import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { DialogHeaderComponent } from './dialog-header.component';
import { Icons } from '../../../core/icons/icon-registry';

describe('DialogHeaderComponent', () => {
  let component: DialogHeaderComponent;
  let fixture: ComponentFixture<DialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogHeaderComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(DialogHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should have empty title by default', () => {
      fixture.detectChanges();
      expect(component.title()).toBe('');
    });

    it('should display the provided title', () => {
      fixture.componentRef.setInput('title', 'Test Dialog');
      fixture.detectChanges();

      const titleElement = (fixture.nativeElement as HTMLElement).querySelector('.dialog-header__title-text')!;
      expect(titleElement.textContent).toContain('Test Dialog');
    });

    it('should have null icon by default', () => {
      fixture.detectChanges();
      expect(component.icon()).toBeNull();
    });

    it('should display icon when provided', () => {
      fixture.componentRef.setInput('icon', Icons.preferences);
      fixture.detectChanges();

      const iconElement = (fixture.nativeElement as HTMLElement).querySelector('.dialog-header__icon');
      expect(iconElement).toBeTruthy();
    });

    it('should not display icon when not provided', () => {
      fixture.detectChanges();

      const iconElement = (fixture.nativeElement as HTMLElement).querySelector('.dialog-header__icon');
      expect(iconElement).toBeFalsy();
    });

    it('should apply custom title class', () => {
      fixture.componentRef.setInput('titleClass', 'custom-title-class');
      fixture.detectChanges();

      const titleElement = (fixture.nativeElement as HTMLElement).querySelector('h2[mat-dialog-title]')!;
      expect(titleElement.classList.contains('custom-title-class')).toBeTrue();
    });
  });

  describe('close button', () => {
    it('should have close icon', () => {
      fixture.detectChanges();
      expect(component.closeIcon).toBe(Icons.close);
    });

    it('should emit closeClick when close button is clicked', () => {
      fixture.detectChanges();

      const closeSpy = spyOn(component.closeClick, 'emit');
      const closeButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.dialog-close-btn')!;
      closeButton.click();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should have proper accessibility attributes', () => {
      fixture.detectChanges();

      const closeButton = (fixture.nativeElement as HTMLElement).querySelector('.dialog-close-btn')!;
      expect(closeButton.getAttribute('aria-label')).toBe('Close dialog');
      expect(closeButton.getAttribute('type')).toBe('button');
    });
  });
});
