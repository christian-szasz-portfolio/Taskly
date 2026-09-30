import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { getBaseTestProviders, createSpyObj, type MockedObject } from '@testing/test-helpers';
import { AppHeaderComponent } from './app-header.component';
import { AuthStore } from '../../../core/state/auth.store';
import { AccountMenuAction } from '../../../core/models/navigation.models';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let authStoreSpy: MockedObject<AuthStore>;
  let dialogSpy: MockedObject<MatDialog>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;
  let router: Router;

  beforeEach(async () => {
    authStoreSpy = createSpyObj<AuthStore>([], {
      trialExpiresAt: signal(null),
      trialDaysRemaining: signal(null),
      canWrite: signal(true)
    });

    dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['afterClosed', 'close']);
    dialogRefSpy.afterClosed.mockReturnValue(of(undefined));

    dialogSpy = createSpyObj<MatDialog>(['open'], {
      _openDialogs: [],
      openDialogs: []
    });
    dialogSpy.open.mockReturnValue(dialogRefSpy as MatDialogRef<unknown>);

    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        ...getBaseTestProviders(),
        { provide: AuthStore, useValue: authStoreSpy }
      ]
    })
      .overrideComponent(AppHeaderComponent, {
        add: {
          providers: [{ provide: MatDialog, useValue: dialogSpy }]
        }
      })
      .compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have notification icon', () => {
    expect(component.notificationIcon).toBeTruthy();
  });

  it('should have account icon', () => {
    expect(component.accountIcon).toBeTruthy();
  });

  it('should have nav links', () => {
    const links = component.navLinks();
    expect(links.length).toBeGreaterThan(0);
    expect(links.some((link) => link.label === 'Home')).toBe(true);
    expect(links.some((link) => link.label === 'Kanban')).toBe(true);
    expect(links.some((link) => link.label === 'Epics')).toBe(true);
    expect(links.some((link) => link.label === 'Backlog')).toBe(true);
    expect(links.some((link) => link.label === 'Resolved')).toBe(true);
  });

  it('should have account menu items', () => {
    expect(component.accountMenuItems.length).toBeGreaterThan(0);
    expect(component.accountMenuItems.some((item) => item.action === AccountMenuAction.About)).toBe(true);
    expect(component.accountMenuItems.some((item) => item.action === AccountMenuAction.Settings)).toBe(true);
    expect(component.accountMenuItems.some((item) => item.action === AccountMenuAction.Maintenance)).toBe(true);
  });

  describe('onAccountMenuItemSelected', () => {
    it('should open about dialog when About is selected', () => {
      const aboutItem = component.accountMenuItems.find((item) => item.action === AccountMenuAction.About)!;

      component.onAccountMenuItemSelected(aboutItem);

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should open the preferences dialog when Preferences is selected', () => {
      const settingsItem = component.accountMenuItems.find((item) => item.action === AccountMenuAction.Settings)!;

      component.onAccountMenuItemSelected(settingsItem);

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should navigate to maintenance page when Maintenance is selected', () => {
      const maintenanceItem = component.accountMenuItems.find((item) => item.action === AccountMenuAction.Maintenance)!;
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onAccountMenuItemSelected(maintenanceItem);

      expect(navigateSpy).toHaveBeenCalledWith(['/maintenance']);
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });
  });

  describe('theme toggle', () => {
    it('should default to light theme', () => {
      expect(component.isDarkMode()).toBe(false);
      expect(component.themeToggleLabel()).toBe('Switch to dark theme');
    });

    it('should flip to dark theme and update the label when toggled', () => {
      component.toggleTheme();

      expect(component.isDarkMode()).toBe(true);
      expect(component.themeToggleLabel()).toBe('Switch to light theme');
    });

    it('should toggle back to light theme on a second toggle', () => {
      component.toggleTheme();
      component.toggleTheme();

      expect(component.isDarkMode()).toBe(false);
    });

    it('should render the theme toggle switch', () => {
      const toggle = (fixture.nativeElement as HTMLElement).querySelector('.theme-toggle mat-slide-toggle');
      expect(toggle).toBeTruthy();
    });
  });

  it('should render app-primary-nav component', () => {
    const nav = (fixture.nativeElement as HTMLElement).querySelector('app-primary-nav');
    expect(nav).toBeTruthy();
  });

  it('should render app-account-menu component', () => {
    const menu = (fixture.nativeElement as HTMLElement).querySelector('app-account-menu');
    expect(menu).toBeTruthy();
  });
});
