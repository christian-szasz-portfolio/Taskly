import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getFormTestProviders } from '@testing/test-helpers';
import { EmptyStateComponent } from './empty-state.component';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      expect(component.icon()).toBeNull();
      expect(component.title()).toBe('No items found');
      expect(component.hint()).toBe('');
      expect(component.variant()).toBe('default');
      expect(component.showAction()).toBeFalse();
      expect(component.actionLabel()).toBe('Action');
    });
  });

  describe('title', () => {
    it('should display default title', () => {
      const title = fixture.debugElement.query(By.css('.empty-state__title'));
      expect((title.nativeElement as HTMLElement).textContent).toBe('No items found');
    });

    it('should display custom title', async () => {
      fixture.componentRef.setInput('title', 'No projects yet');
      fixture.detectChanges();
      await fixture.whenStable();

      const title = fixture.debugElement.query(By.css('.empty-state__title'));
      expect((title.nativeElement as HTMLElement).textContent).toBe('No projects yet');
    });
  });

  describe('icon', () => {
    it('should not show icon when not provided', () => {
      const icon = fixture.debugElement.query(By.css('.empty-state__icon'));
      expect(icon).toBeNull();
    });

    it('should show icon when provided', async () => {
      fixture.componentRef.setInput('icon', faFolder);
      fixture.detectChanges();
      await fixture.whenStable();

      const icon = fixture.debugElement.query(By.css('.empty-state__icon'));
      expect(icon).toBeTruthy();
    });
  });

  describe('hint', () => {
    it('should not show hint when empty', () => {
      const hint = fixture.debugElement.query(By.css('.empty-state__hint'));
      expect(hint).toBeNull();
    });

    it('should show hint when provided', async () => {
      fixture.componentRef.setInput('hint', 'Click to create a new item.');
      fixture.detectChanges();
      await fixture.whenStable();

      const hint = fixture.debugElement.query(By.css('.empty-state__hint'));
      expect(hint).toBeTruthy();
      expect((hint.nativeElement as HTMLElement).textContent).toBe('Click to create a new item.');
    });
  });

  describe('variant', () => {
    it('should not have compact class by default', () => {
      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.classes['empty-state--compact']).toBeFalsy();
    });

    it('should have compact class when variant is compact', async () => {
      fixture.componentRef.setInput('variant', 'compact');
      fixture.detectChanges();
      await fixture.whenStable();

      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.classes['empty-state--compact']).toBeTrue();
    });
  });

  describe('action button', () => {
    it('should not show action button by default', () => {
      const button = fixture.debugElement.query(By.css('.empty-state__action'));
      expect(button).toBeNull();
    });

    it('should show action button when showAction is true', async () => {
      fixture.componentRef.setInput('showAction', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const button = fixture.debugElement.query(By.css('.empty-state__action'));
      expect(button).toBeTruthy();
    });

    it('should display custom action label', async () => {
      fixture.componentRef.setInput('showAction', true);
      fixture.componentRef.setInput('actionLabel', 'Create New');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = fixture.debugElement.query(By.css('.empty-state__action'));
      expect((button.nativeElement as HTMLElement).textContent?.trim()).toBe('Create New');
    });

    it('should emit actionClick when button is clicked', async () => {
      const actionSpy = spyOn(component.actionClick, 'emit');
      fixture.componentRef.setInput('showAction', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const button = fixture.debugElement.query(By.css('.empty-state__action'));
      (button.nativeElement as HTMLElement).click();

      expect(actionSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have role="status" by default', () => {
      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.attributes['role']).toBe('status');
    });

    it('should support role="region"', async () => {
      fixture.componentRef.setInput('role', 'region');
      fixture.detectChanges();
      await fixture.whenStable();

      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.attributes['role']).toBe('region');
    });
  });
});
