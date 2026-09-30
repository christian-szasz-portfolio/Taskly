import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { getFormTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { TaskHeroSectionComponent } from './task-hero-section.component';
import type { TaskStatusStats } from '../status-chart/task-status-chart.component';
import type { TaskHeroCard, TaskHeroIcons } from '../../models/task-board.models';

describe('TaskHeroSectionComponent', () => {
  let fixture: ComponentFixture<TaskHeroSectionComponent>;
  let component: TaskHeroSectionComponent;

  const mockCards: readonly TaskHeroCard[] = [
    { label: 'Total Tasks', value: '42', icon: Icons.plus },
    { label: 'In Progress', value: '12', icon: Icons.sync },
    { label: 'Completed', value: '30', icon: Icons.edit }
  ];

  const mockStats: TaskStatusStats = {
    completed: 30,
    open: 5,
    toDo: 3,
    inProgress: 2,
    testing: 2
  };

  const mockHeroIcons: TaskHeroIcons = {
    sparkles: Icons.sparkles,
    create: Icons.plus,
    refresh: Icons.refresh,
    calendar: Icons.calendar,
    edit: Icons.edit,
    sync: Icons.sync
  };

  let refreshCalled: boolean;

  beforeEach(async () => {
    refreshCalled = false;

    await TestBed.configureTestingModule({
      imports: [TaskHeroSectionComponent],
      providers: [
        ...getFormTestProviders(),
        provideCharts(withDefaultRegisterables())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cards', mockCards);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.componentRef.setInput('heroIcons', mockHeroIcons);

    component.refresh.subscribe(() => refreshCalled = true);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive cards input', () => {
      expect(component.cards()).toEqual(mockCards);
    });

    it('should receive stats input', () => {
      expect(component.stats()).toEqual(mockStats);
    });

    it('should receive heroIcons input', () => {
      expect(component.heroIcons()).toEqual(mockHeroIcons);
    });
  });

  describe('collapsed signal', () => {
    it('should be initially false', () => {
      expect(component.collapsed()).toBe(false);
    });

    it('should toggle to true', () => {
      component.toggleCollapsed();
      expect(component.collapsed()).toBe(true);
    });

    it('should toggle back to false', () => {
      component.toggleCollapsed();
      component.toggleCollapsed();
      expect(component.collapsed()).toBe(false);
    });
  });

  describe('collapseLabel computed', () => {
    it('should return "Collapse summary" when expanded', () => {
      expect(component.collapseLabel()).toBe('Collapse summary');
    });

    it('should return "Expand summary" when collapsed', () => {
      component.toggleCollapsed();
      expect(component.collapseLabel()).toBe('Expand summary');
    });
  });

  describe('collapseIcons', () => {
    it('should have expanded icon', () => {
      expect(component.collapseIcons.expanded).toBeDefined();
    });

    it('should have collapsed icon', () => {
      expect(component.collapseIcons.collapsed).toBeDefined();
    });

    it('should have different icons for expanded and collapsed', () => {
      expect(component.collapseIcons.expanded).not.toBe(component.collapseIcons.collapsed);
    });
  });

  describe('toggleCollapsed method', () => {
    it('should toggle collapsed state', () => {
      const initialState = component.collapsed();
      component.toggleCollapsed();
      expect(component.collapsed()).toBe(!initialState);
    });

    it('should be callable multiple times', () => {
      component.toggleCollapsed();
      expect(component.collapsed()).toBe(true);
      component.toggleCollapsed();
      expect(component.collapsed()).toBe(false);
      component.toggleCollapsed();
      expect(component.collapsed()).toBe(true);
    });
  });

  describe('refresh output', () => {
    it('should emit refresh event', () => {
      component.refresh.emit();
      expect(refreshCalled).toBe(true);
    });

    it('should be callable multiple times', () => {
      let callCount = 0;
      component.refresh.subscribe(() => callCount++);

      component.refresh.emit();
      component.refresh.emit();

      expect(callCount).toBe(2);
    });
  });

  describe('DOM rendering when expanded', () => {
    it('should show eyebrow text', () => {
      const element = fixture.nativeElement as HTMLElement;
      const eyebrow = element.querySelector('.hero__eyebrow');
      expect(eyebrow?.textContent).toContain('Responsive Tasks');
    });

    it('should show title', () => {
      const element = fixture.nativeElement as HTMLElement;
      const title = element.querySelector('h1');
      expect(title?.textContent).toBe('Make progress with clarity');
    });

    it('should show body text', () => {
      const element = fixture.nativeElement as HTMLElement;
      const body = element.querySelector('.hero__body');
      expect(body?.textContent).toContain('Track status');
    });

    it('should render hero cards', () => {
      const element = fixture.nativeElement as HTMLElement;
      const cards = element.querySelectorAll('.hero-card');
      expect(cards.length).toBe(3);
    });

    it('should render create button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const createBtn = element.querySelector('[aria-label="Create task"]');
      expect(createBtn).toBeTruthy();
    });

    it('should render refresh button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const refreshBtn = element.querySelector('[aria-label="Refresh board"]');
      expect(refreshBtn).toBeTruthy();
    });

    it('should render collapse button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const collapseBtn = element.querySelector('.hero__collapse-btn');
      expect(collapseBtn).toBeTruthy();
    });

    it('should include task status chart', () => {
      const element = fixture.nativeElement as HTMLElement;
      const chart = element.querySelector('app-task-status-chart');
      expect(chart).toBeTruthy();
    });
  });

  describe('DOM rendering when collapsed', () => {
    beforeEach(async () => {
      component.toggleCollapsed();
      await fixture.whenStable();
    });

    it('should hide eyebrow text', () => {
      const element = fixture.nativeElement as HTMLElement;
      const eyebrow = element.querySelector('.hero__eyebrow');
      expect(eyebrow).toBeNull();
    });

    it('should still show title', () => {
      const element = fixture.nativeElement as HTMLElement;
      const title = element.querySelector('h1');
      expect(title?.textContent).toBe('Make progress with clarity');
    });

    it('should hide body text', () => {
      const element = fixture.nativeElement as HTMLElement;
      const body = element.querySelector('.hero__body');
      expect(body).toBeNull();
    });

    it('should hide hero cards', () => {
      const element = fixture.nativeElement as HTMLElement;
      const cards = element.querySelectorAll('.hero-card');
      expect(cards.length).toBe(0);
    });

    it('should hide task status chart', () => {
      const element = fixture.nativeElement as HTMLElement;
      const chart = element.querySelector('app-task-status-chart');
      expect(chart).toBeNull();
    });

    it('should still show collapse button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const collapseBtn = element.querySelector('.hero__collapse-btn');
      expect(collapseBtn).toBeTruthy();
    });

    it('should add collapsed class to hero section', () => {
      const element = fixture.nativeElement as HTMLElement;
      const heroSection = element.querySelector('.kanban__hero');
      expect(heroSection?.classList.contains('kanban__hero--collapsed')).toBe(true);
    });
  });

  describe('hero cards rendering', () => {
    it('should display card labels', () => {
      const element = fixture.nativeElement as HTMLElement;
      const cards = element.querySelectorAll('.hero-card');
      const labels = Array.from(cards).map(card => card.querySelector('p')?.textContent);
      expect(labels).toContain('Total Tasks');
      expect(labels).toContain('In Progress');
      expect(labels).toContain('Completed');
    });

    it('should display card values', () => {
      const element = fixture.nativeElement as HTMLElement;
      const cards = element.querySelectorAll('.hero-card');
      const values = Array.from(cards).map(card => card.querySelector('strong')?.textContent);
      expect(values).toContain('42');
      expect(values).toContain('12');
      expect(values).toContain('30');
    });

    it('should render card icons', () => {
      const element = fixture.nativeElement as HTMLElement;
      const cardIcons = element.querySelectorAll('.hero-card fa-icon');
      expect(cardIcons.length).toBe(3);
    });
  });

  describe('create button', () => {
    it('is shown disabled, with the reason: the demo creates nothing', () => {
      const element = fixture.nativeElement as HTMLElement;
      const createBtn = element.querySelector<HTMLButtonElement>('[aria-label="Create task"]');
      expect(createBtn).toBeTruthy();
      expect(createBtn?.disabled).toBe(true);
      expect(component.createDisabledNote).toContain('does not allow creating items');
    });
  });

  describe('accessibility', () => {
    it('should have aria-pressed attribute on collapse button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const collapseBtn = element.querySelector('.hero__collapse-btn');
      expect(collapseBtn?.getAttribute('aria-pressed')).toBe('false');
    });

    it('should update aria-pressed when collapsed', async () => {
      component.toggleCollapsed();
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const collapseBtn = element.querySelector('.hero__collapse-btn');
      expect(collapseBtn?.getAttribute('aria-pressed')).toBe('true');
    });

    it('should have aria-label on collapse button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const collapseBtn = element.querySelector('.hero__collapse-btn');
      expect(collapseBtn?.getAttribute('aria-label')).toBe('Collapse summary');
    });

    it('should update aria-label when collapsed', async () => {
      component.toggleCollapsed();
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const collapseBtn = element.querySelector('.hero__collapse-btn');
      expect(collapseBtn?.getAttribute('aria-label')).toBe('Expand summary');
    });
  });

  describe('input changes', () => {
    it('should update when cards change', async () => {
      const newCards: readonly TaskHeroCard[] = [
        { label: 'New Card', value: '100', icon: Icons.plus }
      ];
      fixture.componentRef.setInput('cards', newCards);
      await fixture.whenStable();
      expect(component.cards()).toEqual(newCards);
    });

    it('should update when stats change', async () => {
      const newStats: TaskStatusStats = {
        completed: 50,
        open: 10,
        toDo: 5,
        inProgress: 3,
        testing: 2
      };
      fixture.componentRef.setInput('stats', newStats);
      await fixture.whenStable();
      expect(component.stats()).toEqual(newStats);
    });

    it('should handle empty cards array', async () => {
      fixture.componentRef.setInput('cards', []);
      await fixture.whenStable();
      expect(component.cards()).toEqual([]);
      const element = fixture.nativeElement as HTMLElement;
      const cards = element.querySelectorAll('.hero-card');
      expect(cards.length).toBe(0);
    });
  });
});
