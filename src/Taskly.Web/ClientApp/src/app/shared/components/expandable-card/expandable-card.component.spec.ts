import { PLATFORM_ID, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../core/icons/icon-registry';
import { ExpandableCardComponent, CardTheme, type ExpandableCardAction } from './expandable-card.component';
import { UserPreferencesService } from '../../../core/services/user/user-preferences.service';

/**
 * Mock UserPreferencesService that doesn't rely on localStorage.
 * This ensures test isolation from other test files.
 */
class MockUserPreferencesService {
  private readonly collapsedPanelsInternal = signal<Set<string>>(new Set());
  private readonly expandedPanelsInternal = signal<Set<string>>(new Set());

  public readonly collapsedPanels = this.collapsedPanelsInternal.asReadonly();
  public readonly expandedPanels = this.expandedPanelsInternal.asReadonly();

  public isPanelExpanded(panelId: string, defaultExpanded = true): boolean {
    if (defaultExpanded) {
      return !this.collapsedPanelsInternal().has(panelId);
    } else {
      return this.expandedPanelsInternal().has(panelId);
    }
  }

  public togglePanel(panelId: string, defaultExpanded = true): boolean {
    const isCurrentlyExpanded = this.isPanelExpanded(panelId, defaultExpanded);
    if (isCurrentlyExpanded) {
      this.collapsePanel(panelId, defaultExpanded);
      return false;
    } else {
      this.expandPanel(panelId, defaultExpanded);
      return true;
    }
  }

  public expandPanel(panelId: string, defaultExpanded = true): void {
    if (defaultExpanded) {
      this.collapsedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.delete(panelId);
        return updated;
      });
    } else {
      this.expandedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.add(panelId);
        return updated;
      });
    }
  }

  public collapsePanel(panelId: string, defaultExpanded = true): void {
    if (defaultExpanded) {
      this.collapsedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.add(panelId);
        return updated;
      });
    } else {
      this.expandedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.delete(panelId);
        return updated;
      });
    }
  }
}

describe('ExpandableCardComponent', (): void => {
  let component: ExpandableCardComponent;
  let fixture: ComponentFixture<ExpandableCardComponent>;
  let mockUserPreferencesService: MockUserPreferencesService;

  const createMockAction = (overrides: Partial<ExpandableCardAction> = {}): ExpandableCardAction => ({
    icon: Icons.edit,
    label: 'Edit',
    tooltip: 'Edit this item',
    accent: CardTheme.Emerald,
    ...overrides
  });

  beforeEach(async (): Promise<void> => {
    // Reset TestBed to ensure fresh service instances
    TestBed.resetTestingModule();

    // Create a fresh mock service for each test
    mockUserPreferencesService = new MockUserPreferencesService();

    await TestBed.configureTestingModule({
      imports: [ExpandableCardComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        // Override the UserPreferencesService with our mock
        { provide: UserPreferencesService, useValue: mockUserPreferencesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableCardComponent);
    component = fixture.componentInstance;
  });

  afterEach((): void => {
    // No need to clean up - mock is recreated each test
  });

  it('should create', (): void => {
    fixture.componentRef.setInput('title', 'Test Card');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('displayKey computed', (): void => {
    it('should return cardKey when defined', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('cardKey', 'CARD-123');
      fixture.detectChanges();
      expect(component.displayKey()).toBe('CARD-123');
    });

    it('should return "Unkeyed" when cardKey is null', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('cardKey', null);
      fixture.detectChanges();
      expect(component.displayKey()).toBe('Unkeyed');
    });

    it('should return "Unkeyed" when cardKey is undefined', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();
      expect(component.displayKey()).toBe('Unkeyed');
    });
  });

  describe('theme input', (): void => {
    it('should default to "indigo"', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();
      expect(component.theme()).toBe('indigo');
    });

    it('should accept different theme values', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('theme', 'amber');
      fixture.detectChanges();
      expect(component.theme()).toBe('amber');
    });
  });

  describe('hasDetails input', (): void => {
    it('should default to false', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();
      expect(component.hasDetails()).toBeFalse();
    });

    it('should accept true value', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();
      expect(component.hasDetails()).toBeTrue();
    });
  });

  describe('showOpenButton input', (): void => {
    it('should default to true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();
      expect(component.showOpenButton()).toBeTrue();
    });

    it('should accept false value', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('showOpenButton', false);
      fixture.detectChanges();
      expect(component.showOpenButton()).toBeFalse();
    });
  });

  describe('isExpanded signal', (): void => {
    it('should be false by default when using local state (no persistenceKey)', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();
      // Without persistenceKey, uses internal signal which starts false
      expect(component.isExpanded()).toBeFalse();
    });

    it('should be true by default when using persistence (with persistenceKey)', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('persistenceKey', 'test-panel');
      fixture.detectChanges();
      // With persistenceKey, default is expanded (not in collapsed set)
      expect(component.isExpanded()).toBeTrue();
    });
  });

  describe('icons computed', (): void => {
    it('should have all required icons', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();

      const icons = component.icons();
      expect(icons.expand).toBeDefined();
      expect(icons.collapse).toBeDefined();
      expect(icons.open).toBeDefined();
    });
  });

  describe('toggleExpanded', (): void => {
    it('should not toggle when hasDetails is false', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', false);
      fixture.detectChanges();

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.expanded, 'emit');

      component.toggleExpanded(mockEvent);

      expect(component.isExpanded()).toBeFalse();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.expanded.emit).not.toHaveBeenCalled();
    });

    it('should toggle isExpanded from false to true when hasDetails is true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.expanded, 'emit');

      component.toggleExpanded(mockEvent);

      expect(component.isExpanded()).toBeTrue();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.expanded.emit).toHaveBeenCalledWith(true);
    });

    it('should toggle isExpanded from true to false when hasDetails is true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      // First toggle to expand
      const expandEvent = new Event('click');
      component.toggleExpanded(expandEvent);
      expect(component.isExpanded()).toBeTrue();

      // Second toggle to collapse
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.expanded, 'emit');

      component.toggleExpanded(mockEvent);

      expect(component.isExpanded()).toBeFalse();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.expanded.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('handleOpen', (): void => {
    it('should emit opened event and stop propagation', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.opened, 'emit');

      component.handleOpen(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.opened.emit).toHaveBeenCalled();
    });
  });

  describe('handlePrimaryAction', (): void => {
    it('should emit primaryActionClicked event and stop propagation', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('primaryAction', createMockAction());
      fixture.detectChanges();

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.primaryActionClicked, 'emit');

      component.handlePrimaryAction(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.primaryActionClicked.emit).toHaveBeenCalled();
    });
  });

  describe('handleSecondaryAction', (): void => {
    it('should emit secondaryActionClicked event and stop propagation', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('secondaryAction', createMockAction({ icon: Icons.delete, label: 'Delete' }));
      fixture.detectChanges();

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.secondaryActionClicked, 'emit');

      component.handleSecondaryAction(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.secondaryActionClicked.emit).toHaveBeenCalled();
    });
  });

  describe('action inputs', (): void => {
    it('should accept primaryAction', (): void => {
      const action = createMockAction();
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('primaryAction', action);
      fixture.detectChanges();

      expect(component.primaryAction()).toEqual(action);
    });

    it('should accept secondaryAction', (): void => {
      const action = createMockAction({ icon: Icons.delete, label: 'Delete', accent: CardTheme.Rose });
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('secondaryAction', action);
      fixture.detectChanges();

      expect(component.secondaryAction()).toEqual(action);
    });

    it('should default primaryAction to null', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();

      expect(component.primaryAction()).toBeNull();
    });

    it('should default secondaryAction to null', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();

      expect(component.secondaryAction()).toBeNull();
    });
  });

  describe('rendering', (): void => {
    it('should render title', (): void => {
      fixture.componentRef.setInput('title', 'My Test Title');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('My Test Title');
    });

    it('should render cardKey', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('cardKey', 'KEY-456');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('KEY-456');
    });

    it('should render "Unkeyed" when no cardKey provided', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Unkeyed');
    });

    it('should show open button when showOpenButton is true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('showOpenButton', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const openButton = compiled.querySelector('[aria-label="Open in new tab"]');
      expect(openButton).toBeTruthy();
    });

    it('should hide open button when showOpenButton is false', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('showOpenButton', false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const openButton = compiled.querySelector('[aria-label="Open in new tab"]');
      expect(openButton).toBeNull();
    });

    it('should show toggle button when hasDetails is true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('[aria-label="Expand details"]');
      expect(toggleButton).toBeTruthy();
    });

    it('should hide toggle button when hasDetails is false', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('[aria-label="Expand details"]');
      expect(toggleButton).toBeNull();
    });

    it('should show details section when expanded and hasDetails is true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      // Toggle to expand
      const mockEvent = new Event('click');
      component.toggleExpanded(mockEvent);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const detailsSection = compiled.querySelector('.expandable-card__details');
      expect(detailsSection).toBeTruthy();
    });

    it('should hide details section when not expanded', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const detailsSection = compiled.querySelector('.expandable-card__details');
      expect(detailsSection).toBeNull();
    });

    it('should apply theme class to article', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('theme', 'amber');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const article = compiled.querySelector('article');
      expect(article?.classList.contains('expandable-card--amber')).toBeTrue();
    });

    it('should apply expanded class when isExpanded is true', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      // Toggle to expand
      const mockEvent = new Event('click');
      component.toggleExpanded(mockEvent);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const article = compiled.querySelector('article');
      expect(article?.classList.contains('expandable-card--expanded')).toBeTrue();
    });

    it('should render primary action button when primaryAction is provided', (): void => {
      const action = createMockAction({ label: 'Primary Action' });
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('primaryAction', action);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('[aria-label="Primary Action"]');
      expect(button).toBeTruthy();
    });

    it('should render secondary action button when secondaryAction is provided', (): void => {
      const action = createMockAction({ icon: Icons.delete, label: 'Secondary Action' });
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('secondaryAction', action);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('[aria-label="Secondary Action"]');
      expect(button).toBeTruthy();
    });
  });

  describe('persistence with persistenceKey', (): void => {
    it('should persist collapsed state to mock service when persistenceKey is provided and panel is collapsed', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.componentRef.setInput('persistenceKey', 'test-panel-1');
      fixture.detectChanges();

      // Panel starts expanded by default (not in collapsed set)
      expect(component.isExpanded()).toBeTrue();

      // Toggle to collapse it
      const mockEvent = new Event('click');
      component.toggleExpanded(mockEvent);

      // Now it should be in the collapsed set (via mock service)
      expect(mockUserPreferencesService.collapsedPanels().has('test-panel-1')).toBeTrue();
    });

    it('should load collapsed state from UserPreferencesService when persistenceKey is provided', (): void => {
      // Use the mock service to collapse a panel before component creation
      mockUserPreferencesService.collapsePanel('service-collapsed-panel');

      // Use main fixture with a matching persistenceKey
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('persistenceKey', 'service-collapsed-panel');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      // The component should reflect the service's collapsed state
      expect(component.isExpanded()).toBeFalse();
    });

    it('should not persist state when persistenceKey is not provided', (): void => {
      const initialCollapsedSize = mockUserPreferencesService.collapsedPanels().size;

      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.detectChanges();

      const mockEvent = new Event('click');
      component.toggleExpanded(mockEvent);

      // Mock service should not have any new collapsed panels
      expect(mockUserPreferencesService.collapsedPanels().size).toBe(initialCollapsedSize);
    });

    it('should use local state when persistenceKey is null', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.componentRef.setInput('persistenceKey', null);
      fixture.detectChanges();

      expect(component.isExpanded()).toBeFalse();

      const mockEvent = new Event('click');
      component.toggleExpanded(mockEvent);

      expect(component.isExpanded()).toBeTrue();
    });

    it('should be expanded by default when persistenceKey is provided and not in collapsed set', (): void => {
      fixture.componentRef.setInput('title', 'Test Card');
      fixture.componentRef.setInput('hasDetails', true);
      fixture.componentRef.setInput('persistenceKey', 'new-panel');
      fixture.detectChanges();

      // Not in collapsed set = expanded by default
      expect(component.isExpanded()).toBeTrue();
    });
  });
});
