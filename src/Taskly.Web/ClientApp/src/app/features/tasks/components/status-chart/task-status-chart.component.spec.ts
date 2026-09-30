import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild, signal } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { getFormTestProviders, getServerTestProviders } from '@testing/test-helpers';
import { TaskStatusChartComponent, type TaskStatusStats } from './task-status-chart.component';

describe('TaskStatusChartComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  const defaultStats: TaskStatusStats = {
    completed: 5,
    open: 3,
    toDo: 2,
    inProgress: 4,
    testing: 1
  };

  @Component({
    standalone: true,
    imports: [TaskStatusChartComponent],
    template: `<app-task-status-chart [stats]="stats()" />`
  })
  class TestHostComponent {
    public readonly componentRef = viewChild(TaskStatusChartComponent);
    public stats = signal<TaskStatusStats>(defaultStats);
  }

  describe('Browser Platform', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          ...getFormTestProviders(),
          provideCharts(withDefaultRegisterables())
        ]
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.autoDetectChanges(true);
    });

    it('should create', () => {
      const component = hostComponent.componentRef();
      expect(component).toBeTruthy();
    });

    it('should receive stats input', () => {
      const component = hostComponent.componentRef();
      expect(component?.stats()).toEqual(defaultStats);
    });

    it('should render chart on browser platform', () => {
      const component = hostComponent.componentRef();
      expect(component?.canRenderChart()).toBe(true);
    });

    describe('values computed', () => {
      it('should calculate completed percentage correctly', () => {
        const component = hostComponent.componentRef();
        const values = component?.values();
        // Total: 5+3+2+4+1 = 15, Completed: 5, Percentage: 33%
        expect(values?.completed).toBe(33);
        expect(values?.total).toBe(15);
      });

      it('should return 0% when no items exist', async () => {
        hostComponent.stats.set({ completed: 0, open: 0, toDo: 0, inProgress: 0, testing: 0 });
        await hostFixture.whenStable();
        const component = hostComponent.componentRef();
        const values = component?.values();
        expect(values?.completed).toBe(0);
        expect(values?.total).toBe(0);
      });

      it('should return 100% when all are completed', async () => {
        hostComponent.stats.set({ completed: 10, open: 0, toDo: 0, inProgress: 0, testing: 0 });
        await hostFixture.whenStable();
        const component = hostComponent.componentRef();
        const values = component?.values();
        expect(values?.completed).toBe(100);
        expect(values?.total).toBe(10);
      });

      it('should handle negative values by treating them as zero', async () => {
        hostComponent.stats.set({ completed: -5, open: 3, toDo: 2, inProgress: 0, testing: 0 });
        await hostFixture.whenStable();
        const component = hostComponent.componentRef();
        const values = component?.values();
        expect(values?.completed).toBe(0);
        expect(values?.total).toBe(5);
      });

      it('should round percentage correctly', async () => {
        hostComponent.stats.set({ completed: 1, open: 0, toDo: 0, inProgress: 2, testing: 0 });
        await hostFixture.whenStable();
        const component = hostComponent.componentRef();
        const values = component?.values();
        // 1 out of 3 = 33.33...% rounds to 33
        expect(values?.completed).toBe(33);
      });
    });

    describe('chartData computed', () => {
      it('should have correct labels', () => {
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        expect(chartData?.labels).toEqual(['Open', 'To-Do', 'In Progress', 'Testing', 'Completed']);
      });

      it('should have correct data values', () => {
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        expect(chartData?.datasets[0].data).toEqual([3, 2, 4, 1, 5]);
      });

      it('should have background colors', () => {
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        const colors = chartData?.datasets[0].backgroundColor as string[];
        expect(colors).toBeTruthy();
        expect(colors.length).toBe(5);
      });

      it('should have hover background colors', () => {
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        const hoverColors = chartData?.datasets[0].hoverBackgroundColor as string[];
        expect(hoverColors).toBeTruthy();
        expect(hoverColors.length).toBe(5);
      });

      it('should have borderWidth of 0', () => {
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        expect(chartData?.datasets[0].borderWidth).toBe(0);
      });

      it('should have hoverOffset of 8', () => {
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        expect(chartData?.datasets[0].hoverOffset).toBe(8);
      });

      it('should handle negative values by treating them as zero', async () => {
        hostComponent.stats.set({ completed: -1, open: -2, toDo: 5, inProgress: 0, testing: 0 });
        await hostFixture.whenStable();
        const component = hostComponent.componentRef();
        const chartData = component?.chartData();
        expect(chartData?.datasets[0].data).toEqual([0, 5, 0, 0, 0]);
      });
    });

    describe('chartOptions signal', () => {
      it('should have legend configuration', () => {
        const component = hostComponent.componentRef();
        const options = component?.chartOptions();
        expect(options?.plugins?.legend?.position).toBe('right');
        expect(options?.plugins?.legend?.labels?.usePointStyle).toBe(true);
      });

      it('should have tooltip configuration', () => {
        const component = hostComponent.componentRef();
        const options = component?.chartOptions();
        expect(options?.plugins?.tooltip?.callbacks?.label).toBeDefined();
      });

      it('should have label callback defined', () => {
        const component = hostComponent.componentRef();
        const options = component?.chartOptions();
        const labelFn = options?.plugins?.tooltip?.callbacks?.label;
        expect(labelFn).toBeDefined();
      });
    });
  });

  describe('Server Platform', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          ...getServerTestProviders(),
          provideCharts(withDefaultRegisterables())
        ]
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.autoDetectChanges(true);
    });

    it('should not render chart on server platform', () => {
      const component = hostComponent.componentRef();
      expect(component?.canRenderChart()).toBe(false);
    });

    it('should return zero data when on server', () => {
      const component = hostComponent.componentRef();
      const chartData = component?.chartData();
      expect(chartData?.datasets[0].data).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          ...getFormTestProviders(),
          provideCharts(withDefaultRegisterables())
        ]
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.autoDetectChanges(true);
    });

    it('should handle all zeros', async () => {
      hostComponent.stats.set({ completed: 0, open: 0, toDo: 0, inProgress: 0, testing: 0 });
      await hostFixture.whenStable();
      const component = hostComponent.componentRef();
      const values = component?.values();
      expect(values?.completed).toBe(0);
      expect(values?.total).toBe(0);
    });

    it('should handle very large numbers', async () => {
      hostComponent.stats.set({ completed: 1000000, open: 500000, toDo: 200000, inProgress: 300000, testing: 0 });
      await hostFixture.whenStable();
      const component = hostComponent.componentRef();
      const values = component?.values();
      expect(values?.total).toBe(2000000);
      expect(values?.completed).toBe(50);
    });

    it('should update when stats change', async () => {
      hostComponent.stats.set({ completed: 10, open: 0, toDo: 0, inProgress: 0, testing: 0 });
      await hostFixture.whenStable();
      const component = hostComponent.componentRef();
      const values = component?.values();
      expect(values?.completed).toBe(100);
      expect(values?.total).toBe(10);
    });
  });
});
