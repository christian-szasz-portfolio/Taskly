import { IssuePriority, SubtaskType } from '../models/task.enums';

const createEnumLookup = <T extends string>(source: Record<string, T>): Map<string, T> => {
  return new Map<string, T>(
    Object.values(source).map((value) => [value.toLowerCase(), value])
  );
};

const PRIORITY_NAME_MAP = createEnumLookup<IssuePriority>(IssuePriority);
const SUBTASK_TYPE_NAME_MAP = createEnumLookup<SubtaskType>(SubtaskType);

export const normalizeNullableText = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeEnumValue = <T extends string>(
  candidate: string | null | undefined,
  lookup: Map<string, T>,
  fallback: T
): T => {
  const normalizedCandidate = candidate?.trim().toLowerCase();
  if (normalizedCandidate) {
    const normalized = lookup.get(normalizedCandidate);
    if (normalized) {
      return normalized;
    }
  }

  return fallback;
};

export const normalizePriorityValue = (
  value: string | null | undefined
): IssuePriority => normalizeEnumValue(value, PRIORITY_NAME_MAP, IssuePriority.Medium);

export const normalizeSubtaskTypeValue = (
  value: string | null | undefined
): SubtaskType => normalizeEnumValue(value, SUBTASK_TYPE_NAME_MAP, SubtaskType.Development);

const normalizeStringCollection = (values: readonly string[] | null | undefined, maxLength: number): string[] => {
  if (!values || values.length === 0) {
    return [];
  }

  const normalized = new Set<string>();
  values.forEach((value) => {
    const sanitized = normalizeNullableText(value);
    if (!sanitized) {
      return;
    }

    normalized.add(sanitized.length > maxLength ? sanitized.slice(0, maxLength) : sanitized);
  });

  return Array.from(normalized);
};

export const normalizeLabels = (labels: readonly string[] | null | undefined): string[] => {
  return normalizeStringCollection(labels, 50);
};

export const normalizeComponents = (components: readonly string[] | null | undefined): string[] => {
  return normalizeStringCollection(components, 80);
};

/**
 * Formats time spent in minutes to a human-readable string.
 * Examples: 30 → "30m", 60 → "1h", 90 → "1h 30m", 120 → "2h"
 */
export const formatTimeSpent = (minutes: number): string | null => {
  if (!minutes || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};
