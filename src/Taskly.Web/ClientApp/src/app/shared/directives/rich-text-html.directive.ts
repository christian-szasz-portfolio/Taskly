import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Renders HTML written by the rich-text editor as it was written. Angular's sanitizer would strip
 * the attributes its code blocks carry, and warn each time it did.
 *
 * @example
 * ```html
 * <div [appRichTextHtml]="description"></div>
 * ```
 */
@Directive({
  selector: '[appRichTextHtml]',
  standalone: true
})
export class RichTextHtmlDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The HTML to render. */
  public readonly appRichTextHtml = input.required<string | null | undefined>();

  private readonly render = effect(() => {
    this.elementRef.nativeElement.innerHTML = this.appRichTextHtml() ?? '';
  });
}
