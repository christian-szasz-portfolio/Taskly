import type { IconDefinition } from '../../../core/icons/icon-registry';

export interface PreferencesCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: IconDefinition;
}
