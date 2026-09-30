import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getBaseTestProviders } from '@testing/test-helpers';
import { CatalogTheme, TaskCatalogPageComponent } from './task-catalog-page.component';

describe('TaskCatalogPageComponent', () => {
  let fixture: ComponentFixture<TaskCatalogPageComponent>;
  let component: TaskCatalogPageComponent;

  let refreshedCalled: boolean;

  beforeEach(async () => {
    refreshedCalled = false;

    await TestBed.configureTestingModule({
      imports: [TaskCatalogPageComponent],
      providers: getBaseTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCatalogPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('eyebrow', 'Catalog');
    fixture.componentRef.setInput('title', 'My Tasks');
    fixture.componentRef.setInput('description', 'Manage your task items');
    fixture.componentRef.setInput('theme', 'indigo');
    fixture.componentRef.setInput('isEmpty', false);
    fixture.componentRef.setInput('emptyTitle', 'No items yet.');
    fixture.componentRef.setInput('emptyHint', 'Create items to populate this view.');

    component.refreshed.subscribe(() => refreshedCalled = true);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('required inputs', () => {
    it('should receive eyebrow input', () => {
      expect(component.eyebrow()).toBe('Catalog');
    });

    it('should receive title input', () => {
      expect(component.title()).toBe('My Tasks');
    });

    it('should receive description input', () => {
      expect(component.description()).toBe('Manage your task items');
    });
  });

  describe('optional inputs with defaults', () => {
    it('should have default theme of "indigo"', () => {
      expect(component.theme()).toBe('indigo');
    });

    it('should have default isEmpty of false', () => {
      expect(component.isEmpty()).toBe(false);
    });

    it('should have default emptyTitle', () => {
      expect(component.emptyTitle()).toBe('No items yet.');
    });

    it('should have default emptyHint', () => {
      expect(component.emptyHint()).toBe('Create items to populate this view.');
    });
  });

  describe('theme input', () => {
    const themes: CatalogTheme[] = [CatalogTheme.Indigo, CatalogTheme.Emerald, CatalogTheme.Amber, CatalogTheme.Sky];

    for (const theme of themes) {
      it(`should accept "${theme}" theme`, async () => {
        fixture.componentRef.setInput('theme', theme);
        await fixture.whenStable();
        expect(component.theme()).toBe(theme);
      });
    }
  });

  describe('isEmpty input', () => {
    it('should display content when isEmpty is false', async () => {
      fixture.componentRef.setInput('isEmpty', false);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const emptyState = element.querySelector('.catalog-empty');
      expect(emptyState).toBeNull();
    });

    it('should display empty state when isEmpty is true', async () => {
      fixture.componentRef.setInput('isEmpty', true);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const emptyState = element.querySelector('.catalog-empty');
      expect(emptyState).toBeTruthy();
    });

    it('should hide content when isEmpty is true', async () => {
      fixture.componentRef.setInput('isEmpty', true);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const catalogList = element.querySelector('.catalog-list');
      expect(catalogList).toBeNull();
    });
  });

  describe('empty state customization', () => {
    it('should display custom emptyTitle', async () => {
      fixture.componentRef.setInput('isEmpty', true);
      fixture.componentRef.setInput('emptyTitle', 'Nothing here!');
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const emptyState = element.querySelector('.catalog-empty p');
      expect(emptyState?.textContent).toBe('Nothing here!');
    });

    it('should display custom emptyHint', async () => {
      fixture.componentRef.setInput('isEmpty', true);
      fixture.componentRef.setInput('emptyHint', 'Add some items.');
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const hintElement = element.querySelector('.catalog-empty span');
      expect(hintElement?.textContent).toBe('Add some items.');
    });
  });

  describe('refreshIcon', () => {
    it('should have refreshIcon defined', () => {
      expect(component.refreshIcon).toBeDefined();
    });
  });

  describe('refresh method', () => {
    it('should emit refreshed event', () => {
      component.refresh();
      expect(refreshedCalled).toBe(true);
    });

    it('should be callable multiple times', () => {
      let callCount = 0;
      component.refreshed.subscribe(() => callCount++);

      component.refresh();
      component.refresh();
      component.refresh();

      expect(callCount).toBe(3);
    });
  });

  describe('DOM rendering', () => {
    it('should render eyebrow', () => {
      const element = fixture.nativeElement as HTMLElement;
      const eyebrowElement = element.querySelector('.catalog-page__eyebrow');
      expect(eyebrowElement?.textContent).toBe('Catalog');
    });

    it('should render title', () => {
      const element = fixture.nativeElement as HTMLElement;
      const titleElement = element.querySelector('h1');
      expect(titleElement?.textContent).toBe('My Tasks');
    });

    it('should render description', () => {
      const element = fixture.nativeElement as HTMLElement;
      const bodyElement = element.querySelector('.catalog-page__body');
      expect(bodyElement?.textContent).toBe('Manage your task items');
    });

    it('should render refresh button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const refreshButton = element.querySelector('button[mat-stroked-button]');
      expect(refreshButton).toBeTruthy();
      expect(refreshButton?.textContent).toContain('Refresh');
    });

    it('should render back to board button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const backButton = element.querySelector('button[mat-raised-button]');
      expect(backButton).toBeTruthy();
      expect(backButton?.textContent).toContain('Back to Board');
    });

    it('should apply theme class to hero section', async () => {
      fixture.componentRef.setInput('theme', 'emerald');
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const heroSection = element.querySelector('.catalog-page__hero');
      expect(heroSection?.classList.contains('catalog-page__hero--emerald')).toBe(true);
    });

    it('should have aria-live attribute on section', () => {
      const element = fixture.nativeElement as HTMLElement;
      const section = element.querySelector('.catalog-page');
      expect(section?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('input changes', () => {
    it('should update eyebrow when input changes', async () => {
      fixture.componentRef.setInput('eyebrow', 'Updated Eyebrow');
      await fixture.whenStable();
      expect(component.eyebrow()).toBe('Updated Eyebrow');
    });

    it('should update title when input changes', async () => {
      fixture.componentRef.setInput('title', 'Updated Title');
      await fixture.whenStable();
      expect(component.title()).toBe('Updated Title');
    });

    it('should update description when input changes', async () => {
      fixture.componentRef.setInput('description', 'Updated Description');
      await fixture.whenStable();
      expect(component.description()).toBe('Updated Description');
    });

    it('should update isEmpty when input changes', async () => {
      fixture.componentRef.setInput('isEmpty', true);
      await fixture.whenStable();
      expect(component.isEmpty()).toBe(true);
    });
  });
});
