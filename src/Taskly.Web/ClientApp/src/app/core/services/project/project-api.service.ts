import { Injectable, inject } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import type { Project, ProjectContributor } from '../../models/project.interfaces';
import { ProjectContributorRole, ProjectStatus } from '../../models/task.enums';
import { DemoDataService } from '../demo/demo-data.service';
import { DEMO_USER_EMAIL, demoResponse } from '../demo/demo-seed';

const PROJECTS_KEY = 'projects';

/**
 * The seeded projects, kept in this browser. Projects frame the demo, so a visitor can only switch
 * which one is active; the contributor list is read-only.
 */
@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly demoData = inject(DemoDataService);

  private read(): Project[] {
    return this.demoData.readCollection<Project>(PROJECTS_KEY, () => []);
  }

  private write(projects: Project[]): void {
    this.demoData.writeCollection(PROJECTS_KEY, projects);
  }

  public list(includeCompleted = true): Observable<Project[]> {
    const projects = this.read().filter((p) => includeCompleted || !p.isCompleted);
    return demoResponse(projects);
  }

  public get(id: string): Observable<Project> {
    const project = this.read().find((p) => p.id === id);
    return project ? demoResponse(project) : throwError(() => new Error('Project not found'));
  }

  public getActive(): Observable<Project | null> {
    const active = this.read().find((p) => p.status === ProjectStatus.Active) ?? null;
    return demoResponse(active);
  }

  public activate(id: string): Observable<Project> {
    const projects = this.read().map((p) => ({
      ...p,
      status: p.id === id ? ProjectStatus.Active : ProjectStatus.Inactive,
    }));
    this.write(projects);
    const active = projects.find((p) => p.id === id);
    return active ? demoResponse(active) : throwError(() => new Error('Project not found'));
  }

  public deactivate(id: string): Observable<Project> {
    let result: Project | undefined;
    const projects = this.read().map((p) => {
      if (p.id !== id) {
        return p;
      }
      result = { ...p, status: ProjectStatus.Inactive };
      return result;
    });
    if (!result) {
      return throwError(() => new Error('Project not found'));
    }
    this.write(projects);
    return demoResponse(result);
  }

  public getContributors(projectId: string): Observable<ProjectContributor[]> {
    return demoResponse<ProjectContributor[]>([
      {
        id: 'demo-owner',
        projectId,
        userId: 'demo-user',
        email: DEMO_USER_EMAIL,
        displayName: 'Demo User',
        role: ProjectContributorRole.Owner,
        addedAtUtc: new Date().toISOString(),
      },
    ]);
  }

}
