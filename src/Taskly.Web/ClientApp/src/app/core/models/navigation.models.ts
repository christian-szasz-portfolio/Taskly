import type { IconDefinition } from '../icons/icon-registry';

export interface PrimaryNavLink {
	readonly label: string;
	readonly route: string | readonly string[];
	readonly icon: IconDefinition;
	readonly queryParams?: Record<string, string>;
}

export enum AccountMenuAction {
  About = 'about',
  Settings = 'settings',
  Maintenance = 'maintenance',
}

export interface AccountMenuItem {
	readonly action: AccountMenuAction;
	readonly label: string;
	readonly icon: IconDefinition;
}
