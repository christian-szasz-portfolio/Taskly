import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, input, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';

export interface TaskStatusStats {
  completed: number;
  open: number;
  toDo: number;
  inProgress: number;
  testing: number;
}

@Component({
  selector: 'app-task-status-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './task-status-chart.component.html',
  styleUrl: './task-status-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusChartComponent {
  public readonly stats = input.required<TaskStatusStats>();

  private readonly platformId = inject(PLATFORM_ID);
  public readonly canRenderChart = signal(isPlatformBrowser(this.platformId));
  private readonly palette = signal({
    open: '#34d399',
    toDo: '#38bdf8',
    inProgress: '#fbbf24',
    testing: '#c084fc',
    completed: '#1f1fe0ff'
  });
  private readonly hoverPalette = signal({
    open: '#86efac',
    toDo: '#bae6fd',
    inProgress: '#fde68a',
    testing: '#e9d5ff',
    completed: '#86b7efff'
  });

  public readonly values = computed(() => {
    const stats = this.stats();
    const open = Math.max(stats.open, 0);
    const toDo = Math.max(stats.toDo, 0);
    const inProgress = Math.max(stats.inProgress, 0);
    const testing = Math.max(stats.testing, 0);
    const completed = Math.max(stats.completed, 0);
    const total = open + toDo + inProgress + testing + completed;
    const completedPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      completed: completedPercent,
      total: total,
    };
  });

  public readonly chartData = computed<ChartData<'pie'>>(() => {
    const stats = this.stats();
    const palette = this.palette();
    const hoverPalette = this.hoverPalette();
    const completed = Math.max(stats.completed, 0);
    const open = Math.max(stats.open, 0);
    const toDo = Math.max(stats.toDo, 0);
    const inProgress = Math.max(stats.inProgress, 0);
    const testing = Math.max(stats.testing, 0);

    return {
      labels: ['Open', 'To-Do', 'In Progress', 'Testing', 'Completed'],
      datasets: [
        {
          data: this.canRenderChart() ? [open, toDo, inProgress, testing, completed] : [0, 0, 0, 0, 0],
          backgroundColor: [palette.open, palette.toDo, palette.inProgress, palette.testing, palette.completed],
          hoverBackgroundColor: [hoverPalette.open, hoverPalette.toDo, hoverPalette.inProgress, hoverPalette.testing, hoverPalette.completed],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  });

  public readonly chartOptions = signal<ChartOptions<'pie'>>({
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#0f172a',
          font: {
            family: 'Space Grotesk, Inter, sans-serif',
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const label = context.label ?? '';
            const value = context.parsed;
            return `${label}: ${value}`;
          },
        },
      },
    },
  });
}
