import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { TaskCatalogCardComponent, type CatalogCardAction } from './task-catalog-card.component';
import { CardTheme } from '../../../../core/models/task.enums';

describe('TaskCatalogCardComponent', () => {
  let fixture: ComponentFixture<TaskCatalogCardComponent>;
  let component: TaskCatalogCardComponent;

  const mockPrimaryAction: CatalogCardAction = {
    icon: Icons.check,
    label: 'Complete',
    tooltip: 'Mark as complete',
    accent: CardTheme.Emerald
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCatalogCardComponent],
      providers: getFormTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCatalogCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('issueKey', 'WF-101');
    fixture.componentRef.setInput('title', 'Test Task');
    fixture.componentRef.setInput('primaryAction', mockPrimaryAction);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive issueKey input', () => {
      expect(component.issueKey()).toBe('WF-101');
    });

    it('should receive title input', () => {
      expect(component.title()).toBe('Test Task');
    });

    it('should receive primaryAction input', () => {
      expect(component.primaryAction()).toEqual(mockPrimaryAction);
    });

    it('should handle null issueKey', async () => {
      fixture.componentRef.setInput('issueKey', null);
      await fixture.whenStable();
      expect(component.issueKey()).toBeNull();
    });

    it('should handle undefined issueKey', async () => {
      fixture.componentRef.setInput('issueKey', undefined);
      await fixture.whenStable();
      expect(component.issueKey()).toBeUndefined();
    });

    it('should handle null primaryAction', async () => {
      fixture.componentRef.setInput('primaryAction', null);
      await fixture.whenStable();
      expect(component.primaryAction()).toBeNull();
    });
  });

  describe('linkIcon', () => {
    it('should have linkIcon defined', () => {
      expect(component.linkIcon).toBeDefined();
    });
  });

  describe('open method', () => {
    it('should emit opened event and stop propagation', () => {
      const openedSpy = spyOn(component.opened, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.open(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(openedSpy).toHaveBeenCalled();
    });

    it('should be callable multiple times', () => {
      const openedSpy = spyOn(component.opened, 'emit');

      component.open(new Event('click'));
      component.open(new Event('click'));

      expect(openedSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('handlePrimaryAction method', () => {
    it('should emit primaryActionClicked event and stop propagation', () => {
      const actionSpy = spyOn(component.primaryActionClicked, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.handlePrimaryAction(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(actionSpy).toHaveBeenCalled();
    });

    it('should be callable multiple times', () => {
      const actionSpy = spyOn(component.primaryActionClicked, 'emit');

      component.handlePrimaryAction(new Event('click'));
      component.handlePrimaryAction(new Event('click'));

      expect(actionSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('CatalogCardAction interface', () => {
    it('should accept action with all properties', async () => {
      const fullAction: CatalogCardAction = {
        icon: Icons.check,
        label: 'Action Label',
        tooltip: 'Action Tooltip',
        accent: CardTheme.Sky
      };
      fixture.componentRef.setInput('primaryAction', fullAction);
      await fixture.whenStable();
      expect(component.primaryAction()).toEqual(fullAction);
    });

    it('should accept action with only required properties', async () => {
      const minimalAction: CatalogCardAction = {
        icon: Icons.check,
        label: 'Minimal Action'
      };
      fixture.componentRef.setInput('primaryAction', minimalAction);
      await fixture.whenStable();
      expect(component.primaryAction()?.icon).toEqual(Icons.check);
      expect(component.primaryAction()?.label).toBe('Minimal Action');
      expect(component.primaryAction()?.tooltip).toBeUndefined();
      expect(component.primaryAction()?.accent).toBeUndefined();
    });

    it('should accept all accent options', async () => {
      const accents: CardTheme[] = [CardTheme.Sky, CardTheme.Emerald, CardTheme.Amber, CardTheme.Rose];

      for (const accent of accents) {
        const action: CatalogCardAction = {
          icon: Icons.check,
          label: 'Test',
          accent
        };
        fixture.componentRef.setInput('primaryAction', action);
        await fixture.whenStable();
        expect(component.primaryAction()?.accent).toBe(accent);
      }
    });
  });

  describe('DOM rendering', () => {
    it('should render issue key when provided', () => {
      const element = fixture.nativeElement as HTMLElement;
      const keyElement = element.querySelector('.catalog-card__key');
      expect(keyElement?.textContent).toContain('WF-101');
    });

    it('should render "Unkeyed" when issueKey is null', async () => {
      fixture.componentRef.setInput('issueKey', null);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const keyElement = element.querySelector('.catalog-card__key');
      expect(keyElement?.textContent).toContain('Unkeyed');
    });

    it('should render title', () => {
      const element = fixture.nativeElement as HTMLElement;
      const titleElement = element.querySelector('h2');
      expect(titleElement?.textContent).toBe('Test Task');
    });

    it('should render primary action button when action is provided', () => {
      const element = fixture.nativeElement as HTMLElement;
      const actionButton = element.querySelector('.catalog-card__action');
      expect(actionButton).toBeTruthy();
    });

    it('should not render primary action button when action is null', async () => {
      fixture.componentRef.setInput('primaryAction', null);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const actionButton = element.querySelector('.catalog-card__action');
      expect(actionButton).toBeNull();
    });

    it('should render open link button', () => {
      const element = fixture.nativeElement as HTMLElement;
      const linkButton = element.querySelector('.catalog-card__link');
      expect(linkButton).toBeTruthy();
    });
  });
});
