// =============================================================================
// Project Mock Factories
// =============================================================================
// Centralized mock factories for Project testing
// Import with: import { createMockProject } from '@testing/mock-factories';

import { ProjectStatus } from '../../app/core/models/task.enums';
import type { Project } from '../../app/core/models/project.interfaces';

// =============================================================================
// Raw API Response Types
// =============================================================================

/**
 * Raw API response format for Project.
 */
export interface RawProject {
  id: string;
  key: string;
  status: string;
  title: string;
  description: string | null;
  dueAtUtc: string | null;
  isCompleted: boolean;
  owner: string | null;
  labels: readonly string[] | null;
  components: readonly string[] | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  completedAtUtc: string | null;
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Creates a mock Project with sensible defaults.
 *
 * @param overrides - Partial Project to override defaults
 * @returns A complete Project for testing
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    key: 'PROJ-1',
    status: ProjectStatus.Inactive,
    title: 'Test Project',
    description: 'A test project description',
    dueAtUtc: '2025-12-31T00:00:00Z',
    isCompleted: false,
    owner: 'Test Owner',
    labels: ['label1', 'label2'],
    components: ['component1'],
    createdAtUtc: '2025-01-01T00:00:00Z',
    updatedAtUtc: null,
    completedAtUtc: null,
    ...overrides
  };
}

/**
 * Creates a raw API response mock for Project.
 *
 * @param overrides - Partial RawProject to override defaults
 * @returns A raw API response format for HTTP mocking
 */
export function createRawMockProject(overrides: Partial<RawProject> = {}): RawProject {
  return {
    id: 'project-1',
    key: 'PROJ-1',
    status: 'Inactive',
    title: 'Test Project',
    description: 'A test project description',
    dueAtUtc: '2025-12-31T00:00:00Z',
    isCompleted: false,
    owner: 'Test Owner',
    labels: ['label1', 'label2'],
    components: ['component1'],
    createdAtUtc: '2025-01-01T00:00:00Z',
    updatedAtUtc: null,
    completedAtUtc: null,
    ...overrides
  };
}

/**
 * Creates multiple mock projects with unique IDs.
 *
 * @param count - Number of projects to create
 * @param overrides - Common overrides to apply to all items
 * @returns Array of Projects
 */
export function createMockProjects(count: number, overrides: Partial<Project> = {}): Project[] {
  return Array.from({ length: count }, (_, index) =>
    createMockProject({
      id: `project-${index + 1}`,
      key: `PROJ-${index + 1}`,
      title: `Test Project ${index + 1}`,
      ...overrides
    })
  );
}

/**
 * Creates an active project mock.
 */
export function createMockActiveProject(overrides: Partial<Project> = {}): Project {
  return createMockProject({
    status: ProjectStatus.Active,
    ...overrides
  });
}
