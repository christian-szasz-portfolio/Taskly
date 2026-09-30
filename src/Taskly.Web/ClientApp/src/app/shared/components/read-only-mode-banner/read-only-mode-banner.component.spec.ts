import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { createSpyObj, getFormTestProviders, type MockedObject } from '@testing/test-helpers';
import { ReadOnlyModeBannerComponent } from './read-only-mode-banner.component';
import { AuthStore } from '../../../core/state/auth.store';
import type { DemoUser } from '../../../core/models/auth.model';

describe('ReadOnlyModeBannerComponent', (): void => {
  let component: ReadOnlyModeBannerComponent;
  let fixture: ComponentFixture<ReadOnlyModeBannerComponent>;
  let authStoreSpy: MockedObject<AuthStore>;
  const userSignal = signal<DemoUser | null>(null);
  const canWriteSignal = signal(false);

  /** Sets whether the demo session is up and whether the trial still allows edits */
  const setSession = (started: boolean, canWrite: boolean): void => {
    userSignal.set(started ? { id: 'demo-user', email: 'you@taskly.demo', firstName: 'Demo', fullName: 'Demo User' } : null);
    canWriteSignal.set(canWrite);
  };

  beforeEach(async (): Promise<void> => {
    setSession(true, false);

    authStoreSpy = createSpyObj<AuthStore>([], {
      user: userSignal,
      canWrite: canWriteSignal
    });

    await TestBed.configureTestingModule({
      imports: [ReadOnlyModeBannerComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: AuthStore, useValue: authStoreSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadOnlyModeBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shouldShow', (): void => {
    it('should show once the trial no longer allows edits', (): void => {
      setSession(true, false);
      fixture.detectChanges();

      expect(component.shouldShow()).toBeTrue();
    });

    it('should hide when user can write', (): void => {
      setSession(true, true);
      fixture.detectChanges();

      expect(component.shouldShow()).toBeFalse();
    });

    it('should hide before the demo session is up', (): void => {
      setSession(false, false);
      fixture.detectChanges();

      expect(component.shouldShow()).toBeFalse();
    });

  });

  describe('toggleExpanded', (): void => {
    it('should toggle isExpanded from false to true', (): void => {
      fixture.detectChanges();
      expect(component.isExpanded()).toBeFalse();

      component.toggleExpanded();

      expect(component.isExpanded()).toBeTrue();
    });

    it('should toggle isExpanded from true to false', (): void => {
      fixture.detectChanges();
      component.toggleExpanded(); // Set to true
      expect(component.isExpanded()).toBeTrue();

      component.toggleExpanded();

      expect(component.isExpanded()).toBeFalse();
    });
  });

  describe('rendering', (): void => {
    it('should render banner when in read-only mode', (): void => {
      setSession(true, false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const banner = compiled.querySelector('.readonly-banner');
      expect(banner).toBeTruthy();
    });

    it('should not render banner when user can write', (): void => {
      setSession(true, true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const banner = compiled.querySelector('.readonly-banner');
      expect(banner).toBeNull();
    });

    it('should show main text', (): void => {
      setSession(true, false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.querySelector('.readonly-banner__text');
      expect(text?.textContent?.trim()).toBe('You are in read-only mode');
    });

    it('should show toggle button', (): void => {
      setSession(true, false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toggle = compiled.querySelector('.readonly-banner__toggle');
      expect(toggle).toBeTruthy();
      expect(toggle?.textContent).toContain('What does this mean?');
    });

    it('should hide details initially', (): void => {
      setSession(true, false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const details = compiled.querySelector('.readonly-banner__details');
      expect(details).toBeNull();
    });

    it('should show details when expanded', (): void => {
      setSession(true, false);
      fixture.detectChanges();

      component.toggleExpanded();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const details = compiled.querySelector('.readonly-banner__details');
      expect(details).toBeTruthy();
    });

    it('should show bullet list in details', (): void => {
      setSession(true, false);
      fixture.detectChanges();
      component.toggleExpanded();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const listItems = compiled.querySelectorAll('.readonly-banner__list li');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });
});
