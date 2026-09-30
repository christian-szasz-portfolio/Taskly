import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { PrimaryNavLink } from '../../../core/models/navigation.models';

@Component({
	selector: 'app-primary-nav',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
	templateUrl: './app-primary-nav.component.html',
	styleUrl: './app-primary-nav.component.scss'
})
export class AppPrimaryNavComponent {
	public readonly links = input.required<readonly PrimaryNavLink[]>();
}
