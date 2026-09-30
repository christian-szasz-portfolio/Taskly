import { normalizeNullableText, normalizePriorityValue, normalizeSubtaskTypeValue, normalizeLabels, normalizeComponents } from './task.utility';
import { IssuePriority, SubtaskType } from '../models/task.enums';

describe('task.utility', () => {
  describe('normalizeNullableText', () => {
    it('should return null for null input', () => {
      expect(normalizeNullableText(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(normalizeNullableText(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(normalizeNullableText('')).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      expect(normalizeNullableText('   ')).toBeNull();
      expect(normalizeNullableText('\t\n')).toBeNull();
    });

    it('should trim and return valid strings', () => {
      expect(normalizeNullableText('hello')).toBe('hello');
      expect(normalizeNullableText('  hello  ')).toBe('hello');
      expect(normalizeNullableText('hello world')).toBe('hello world');
    });
  });

  describe('normalizePriorityValue', () => {
    it('should normalize valid priority values (case-insensitive)', () => {
      expect(normalizePriorityValue('High')).toBe(IssuePriority.High);
      expect(normalizePriorityValue('high')).toBe(IssuePriority.High);
      expect(normalizePriorityValue('HIGH')).toBe(IssuePriority.High);
      expect(normalizePriorityValue('Medium')).toBe(IssuePriority.Medium);
      expect(normalizePriorityValue('medium')).toBe(IssuePriority.Medium);
      expect(normalizePriorityValue('Low')).toBe(IssuePriority.Low);
      expect(normalizePriorityValue('low')).toBe(IssuePriority.Low);
    });

    it('should return Medium as fallback for invalid values', () => {
      expect(normalizePriorityValue('invalid')).toBe(IssuePriority.Medium);
      expect(normalizePriorityValue('')).toBe(IssuePriority.Medium);
      expect(normalizePriorityValue(null)).toBe(IssuePriority.Medium);
      expect(normalizePriorityValue(undefined)).toBe(IssuePriority.Medium);
    });

    it('should handle values with whitespace', () => {
      expect(normalizePriorityValue('  high  ')).toBe(IssuePriority.High);
    });
  });

  describe('normalizeSubtaskTypeValue', () => {
    it('should normalize valid subtask type values (case-insensitive)', () => {
      expect(normalizeSubtaskTypeValue('Development')).toBe(SubtaskType.Development);
      expect(normalizeSubtaskTypeValue('development')).toBe(SubtaskType.Development);
      expect(normalizeSubtaskTypeValue('Translations')).toBe(SubtaskType.Translations);
      expect(normalizeSubtaskTypeValue('BugInDevelopment')).toBe(SubtaskType.BugInDevelopment);
    });

    it('should return Development as fallback for invalid values', () => {
      expect(normalizeSubtaskTypeValue('invalid')).toBe(SubtaskType.Development);
      expect(normalizeSubtaskTypeValue('')).toBe(SubtaskType.Development);
      expect(normalizeSubtaskTypeValue(null)).toBe(SubtaskType.Development);
      expect(normalizeSubtaskTypeValue(undefined)).toBe(SubtaskType.Development);
    });
  });

  describe('normalizeLabels', () => {
    it('should return empty array for null', () => {
      expect(normalizeLabels(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect(normalizeLabels(undefined)).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      expect(normalizeLabels([])).toEqual([]);
    });

    it('should normalize and deduplicate labels', () => {
      expect(normalizeLabels(['Label1', 'Label2', 'Label1'])).toEqual(['Label1', 'Label2']);
    });

    it('should trim label values', () => {
      expect(normalizeLabels(['  Label1  ', 'Label2'])).toEqual(['Label1', 'Label2']);
    });

    it('should filter out null and empty labels', () => {
      expect(normalizeLabels(['Label1', '', '  ', 'Label2'])).toEqual(['Label1', 'Label2']);
    });

    it('should truncate labels longer than 50 characters', () => {
      const longLabel = 'a'.repeat(60);
      const result = normalizeLabels([longLabel]);
      expect(result[0].length).toBe(50);
    });
  });

  describe('normalizeComponents', () => {
    it('should return empty array for null', () => {
      expect(normalizeComponents(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect(normalizeComponents(undefined)).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      expect(normalizeComponents([])).toEqual([]);
    });

    it('should normalize and deduplicate components', () => {
      expect(normalizeComponents(['Component1', 'Component2', 'Component1'])).toEqual(['Component1', 'Component2']);
    });

    it('should trim component values', () => {
      expect(normalizeComponents(['  Component1  ', 'Component2'])).toEqual(['Component1', 'Component2']);
    });

    it('should truncate components longer than 80 characters', () => {
      const longComponent = 'a'.repeat(100);
      const result = normalizeComponents([longComponent]);
      expect(result[0].length).toBe(80);
    });
  });
});
