import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { Project } from '../../../../core/models/project.interfaces';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent {
  public readonly projects = input.required<Project[]>();

  public readonly activateProject = output<Project>();
  public readonly deactivateProject = output<Project>();

  public handleActivate(project: Project): void {
    this.activateProject.emit(project);
  }

  public handleDeactivate(project: Project): void {
    this.deactivateProject.emit(project);
  }

  public trackById(_: number, project: Project): string {
    return project.id;
  }
}
