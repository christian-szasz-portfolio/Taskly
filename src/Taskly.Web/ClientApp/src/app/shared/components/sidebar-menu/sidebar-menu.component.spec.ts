import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { getFormTestProviders } from '@testing/test-helpers';
import { SidebarMenuComponent, type SidebarMenuItem } from './sidebar-menu.component';
import { faCog, faUser, faBell } from '@fortawesome/free-solid-svg-icons';

// Test host component because SidebarMenuComponent has required inputs
@Component({
  standalone: true,
  imports: [SidebarMenuComponent],
  template: `
    <app-sidebar-menu
      [items]="items"
      [selectedId]="selectedId"
      [ariaLabel]="ariaLabel"
      (selectionChange)="onSelect($event)" />
  `
})
class TestHostComponent {
  items: SidebarMenuItem[] = [
    { id: 'settings', label: 'Settings', icon: faCog },
    { id: 'profile', label: 'Profile', icon: faUser },
    { id: 'notifications', label: 'Notifications', icon: faBell, disabled: true }
  ];
  selectedId: string | null = 'settings';
  ariaLabel = 'Test menu';

  onSelect(id: string): void {
    this.selectedId = id;
  }
}

describe('SidebarMenuComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let menuComponent: SidebarMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    menuComponent = fixture.debugElement.query(By.directive(SidebarMenuComponent)).componentInstance as SidebarMenuComponent;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(menuComponent).toBeTruthy();
    });

    it('should display all menu items', () => {
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      expect(items.length).toBe(3);
    });
  });

  describe('menu item display', () => {
    it('should display item labels', () => {
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      expect((items[0].nativeElement as HTMLElement).textContent).toContain('Settings');
      expect((items[1].nativeElement as HTMLElement).textContent).toContain('Profile');
      expect((items[2].nativeElement as HTMLElement).textContent).toContain('Notifications');
    });

    it('should show icons for all items', () => {
      const icons = fixture.debugElement.queryAll(By.css('.sidebar-menu__item fa-icon'));
      expect(icons.length).toBe(3);
    });
  });

  describe('selection', () => {
    it('should mark selected item as active', () => {
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      expect(items[0].classes['sidebar-menu__item--active']).toBeTrue();
      expect(items[1].classes['sidebar-menu__item--active']).toBeFalsy();
    });

    it('should set aria-current on selected item', () => {
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      expect(items[0].attributes['aria-current']).toBe('page');
      expect(items[1].attributes['aria-current']).toBeUndefined();
    });

    it('should emit selectionChange when item is clicked', async () => {
      const selectionSpy = spyOn(hostComponent, 'onSelect');
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));

      (items[1].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(selectionSpy).toHaveBeenCalledWith('profile');
    });

    it('should update active state after selection', async () => {
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      (items[1].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const updatedItems = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      expect(updatedItems[0].classes['sidebar-menu__item--active']).toBeFalsy();
      expect(updatedItems[1].classes['sidebar-menu__item--active']).toBeTrue();
    });
  });

  describe('disabled items', () => {
    it('should mark disabled items', () => {
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));
      expect((items[2].nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });

    it('should not emit selectionChange for disabled items', () => {
      const selectionSpy = spyOn(menuComponent.selectionChange, 'emit');
      const items = fixture.debugElement.queryAll(By.css('.sidebar-menu__item'));

      (items[2].nativeElement as HTMLElement).click();

      expect(selectionSpy).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have navigation role', () => {
      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav.attributes['role']).toBe('navigation');
    });

    it('should have aria-label', () => {
      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav.attributes['aria-label']).toBe('Test menu');
    });
  });

  describe('isSelected method', () => {
    it('should return true for selected item', () => {
      expect(menuComponent.isSelected('settings')).toBeTrue();
    });

    it('should return false for non-selected item', () => {
      expect(menuComponent.isSelected('profile')).toBeFalse();
    });
  });
});
