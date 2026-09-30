import type { ProjectContributorRole, ProjectStatus } from './task.enums';

export interface Project {
  id: string;
  key?: string | null;
  status: ProjectStatus;
  title: string;
  description?: string | null;
  dueAtUtc?: string | null;
  isCompleted: boolean;
  owner?: string | null;
  labels: string[];
  components: string[];
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  completedAtUtc?: string | null;
}

/**
 * Represents a project contributor (owner or contributor).
 */
export interface ProjectContributor {
  id: string;
  projectId: string;
  userId: string;
  email: string;
  displayName: string | null;
  role: ProjectContributorRole;
  addedAtUtc: string;
}
