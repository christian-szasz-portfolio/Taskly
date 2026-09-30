import { CommonModule } from '@angular/common';
import { Component, type ElementRef, HostListener, input, output, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { AccountMenuItem } from '../../../core/models/navigation.models';

@Component({
	selector: 'app-account-menu',
	standalone: true,
	imports: [CommonModule, MatButtonModule, FontAwesomeModule],
	templateUrl: './app-account-menu.component.html',
	styleUrl: './app-account-menu.component.scss'
})
export class AppAccountMenuComponent {
  private readonly accountMenuRef = viewChild<ElementRef<HTMLElement>>('accountMenuRef');
	public readonly items = input.required<readonly AccountMenuItem[]>();
	public readonly icon = input.required<IconDefinition>();
	public readonly itemSelected = output<AccountMenuItem>();
	private readonly menuId = 'account-menu';
	public readonly isOpen = signal(false);

	public toggleMenu(event: MouseEvent): void {
		event.stopPropagation();
		this.isOpen.update((open) => !open);
	}

	public closeMenu(): void {
		if (this.isOpen()) {
			this.isOpen.set(false);
		}
	}

	public handleSelection(item: AccountMenuItem): void {
		this.itemSelected.emit(item);
		this.closeMenu();
	}

	@HostListener('document:click', ['$event'])
	public handleDocumentClick(event: MouseEvent): void {
		if (!this.isOpen()) {
			return;
		}

		const container = this.accountMenuRef()?.nativeElement;
		const target = event.target as Node | null;
		if (container && target && !container.contains(target)) {
			this.isOpen.set(false);
		}
	}

	@HostListener('document:keydown.escape')
	public handleEscape(): void {
		this.closeMenu();
	}

	public menuIdentifier(): string {
		return this.menuId;
	}
}
