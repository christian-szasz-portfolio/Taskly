import { Directive, ElementRef, effect, inject, input } from '@angular/core';

import { sanitizeRichText } from '../../core/utilities/sanitize-rich-text.utility';

/**
 * Renders HTML written by the rich-text editor. Angular's sanitizer would strip the attributes its
 * code blocks carry, so the HTML is passed through a rich-text sanitizer instead: it keeps the
 * code-block markup and removes only what is dangerous (scripts, event handlers, inline styles,
 * unsafe URLs), so a tampered description cannot inject active content.
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
    this.elementRef.nativeElement.innerHTML = sanitizeRichText(this.appRichTextHtml());
  });
}
