import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthStore } from '../../state/auth.store';
import { ProjectApiService } from '../project/project-api.service';
import { SessionContextService } from '../project/session-context.service';
import type { ComboBoxOption } from '../../../shared/components/combo-box/combo-box.component';
import type { ProjectContributor } from '../../models/project.interfaces';

export interface UserInfo {
  name: string;
  displayName: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly authStore = inject(AuthStore);
  private readonly sessionContext = inject(SessionContextService);
  private readonly projectApi = inject(ProjectApiService);

  /**
   * Signal tracking the contributors of the active project.
   * Updated whenever the active project changes.
   */
  private readonly contributors = toSignal(
    this.sessionContext.project$.pipe(
      switchMap((project) => {
        if (!project?.id) {
          return of([]);
        }
        return this.projectApi.getContributors(project.id).pipe(
          catchError(() => of([]))
        );
      })
    ),
    { initialValue: [] as ProjectContributor[] }
  );

  public readonly currentUser = computed(() => {
    const auth = this.authStore.user();
    if (!auth?.email) {
      return null;
    }

    return {
      name: auth.email,
      displayName: auth.fullName ?? null
    } satisfies UserInfo;
  });

  /**
   * Returns a list of available users for selection from project contributors.
   * Current user appears first, followed by other contributors.
   * Includes "Unassigned" as the first option.
   */
  public getUserOptions(): ComboBoxOption[] {
    const current = this.currentUser();
    const contributorList = this.contributors();
    const options: ComboBoxOption[] = [];

    // Add "Unassigned" option first
    options.push({
      value: '',
      label: 'Unassigned',
      description: 'No user assigned'
    });

    // Track if current user was already added from contributors
    let currentUserAdded = false;
    const currentEmailLower = current?.name?.toLowerCase() ?? '';

    // Add current user first if they are a contributor
    if (current?.name) {
      const currentContributor = contributorList.find(
        (c) => c.email.toLowerCase() === currentEmailLower
      );
      if (currentContributor) {
        const label = currentContributor.displayName ?? currentContributor.email;
        options.push({
          value: currentContributor.email,
          label: label,
          description: currentContributor.email !== label ? currentContributor.email : undefined
        });
        currentUserAdded = true;
      }
    }

    // Add remaining contributors (excluding current user if already added)
    for (const contributor of contributorList) {
      if (currentUserAdded && contributor.email.toLowerCase() === currentEmailLower) {
        continue;
      }

      const label = contributor.displayName ?? contributor.email;
      options.push({
        value: contributor.email,
        label: label,
        description: contributor.email !== label ? contributor.email : undefined
      });
    }

    return options;
  }

  /**
   * Checks if an email belongs to an active contributor.
   */
  public isActiveContributor(email: string | null | undefined): boolean {
    if (!email) {
      return false;
    }
    const emailLower = email.toLowerCase();
    return this.contributors().some((c) => c.email.toLowerCase() === emailLower);
  }
}
