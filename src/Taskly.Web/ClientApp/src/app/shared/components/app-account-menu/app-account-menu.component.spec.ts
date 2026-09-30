import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { AppAccountMenuComponent } from './app-account-menu.component';
import { Icons } from '../../../core/icons/icon-registry';
import type { AccountMenuItem } from '../../../core/models/navigation.models';
import { AccountMenuAction } from '../../../core/models/navigation.models';

describe('AppAccountMenuComponent', () => {
  let component: AppAccountMenuComponent;
  let fixture: ComponentFixture<AppAccountMenuComponent>;

  const mockItems: AccountMenuItem[] = [
    { action: AccountMenuAction.About, label: 'Profile', icon: Icons.user },
    { action: AccountMenuAction.Maintenance, label: 'Maintenance', icon: Icons.maintenance }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAccountMenuComponent],
      providers: getFormTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppAccountMenuComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('icon', Icons.user);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have items input', () => {
    expect(component.items()).toEqual(mockItems);
  });

  it('should have icon input', () => {
    expect(component.icon()).toBe(Icons.user);
  });

  it('should start with menu closed', () => {
    expect(component.isOpen()).toBe(false);
  });

  describe('toggleMenu', () => {
    it('should toggle menu open state', () => {
      const event = new MouseEvent('click');
      const stopPropagationSpy = spyOn(event, 'stopPropagation');

      component.toggleMenu(event);
      expect(component.isOpen()).toBe(true);
      expect(stopPropagationSpy).toHaveBeenCalled();

      component.toggleMenu(event);
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('closeMenu', () => {
    it('should close the menu when open', () => {
      component.toggleMenu(new MouseEvent('click'));
      expect(component.isOpen()).toBe(true);

      component.closeMenu();
      expect(component.isOpen()).toBe(false);
    });

    it('should do nothing when already closed', () => {
      expect(component.isOpen()).toBe(false);
      component.closeMenu();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('handleSelection', () => {
    it('should emit itemSelected and close the menu', () => {
      const emitSpy = spyOn(component.itemSelected, 'emit');
      const testItem = mockItems[0];

      component.toggleMenu(new MouseEvent('click'));
      component.handleSelection(testItem);

      expect(emitSpy).toHaveBeenCalledWith(testItem);
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('handleDocumentClick', () => {
    it('should close menu when clicking outside', () => {
      component.toggleMenu(new MouseEvent('click'));
      expect(component.isOpen()).toBe(true);

      // Simulate click outside
      const outsideClick = new MouseEvent('click');
      Object.defineProperty(outsideClick, 'target', { value: document.body });

      component.handleDocumentClick(outsideClick);
      expect(component.isOpen()).toBe(false);
    });

    it('should not close menu when menu is already closed', () => {
      expect(component.isOpen()).toBe(false);

      const outsideClick = new MouseEvent('click');
      Object.defineProperty(outsideClick, 'target', { value: document.body });

      component.handleDocumentClick(outsideClick);
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('handleEscape', () => {
    it('should close the menu on Escape key', () => {
      component.toggleMenu(new MouseEvent('click'));
      expect(component.isOpen()).toBe(true);

      component.handleEscape();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('menuIdentifier', () => {
    it('should return the menu id', () => {
      expect(component.menuIdentifier()).toBe('account-menu');
    });
  });
});
