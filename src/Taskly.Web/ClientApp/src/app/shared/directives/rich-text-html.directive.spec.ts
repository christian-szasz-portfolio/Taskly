import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RichTextHtmlDirective } from './rich-text-html.directive';

@Component({
  standalone: true,
  imports: [RichTextHtmlDirective],
  template: '<div [appRichTextHtml]="html()"></div>'
})
class HostComponent {
  public readonly html = signal<string | null>('<p>First</p>');
}

describe('RichTextHtmlDirective', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, element: (fixture.nativeElement as HTMLElement).querySelector('div')! };
  }

  it('renders the HTML it is given', () => {
    const { element } = render();

    expect(element.innerHTML).toBe('<p>First</p>');
  });

  it('keeps the attributes a code block carries', () => {
    const { fixture, element } = render();
    fixture.componentInstance.html.set('<pre class="rte-code-block" data-language="ts"><code>x</code></pre>');
    fixture.detectChanges();

    expect(element.querySelector('pre')?.getAttribute('data-language')).toBe('ts');
  });

  it('renders nothing for no content', () => {
    const { fixture, element } = render();
    fixture.componentInstance.html.set(null);
    fixture.detectChanges();

    expect(element.innerHTML).toBe('');
  });
});
