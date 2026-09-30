import { sanitizeRichText } from './sanitize-rich-text.utility';

describe('sanitizeRichText', () => {
  it('returns empty for empty input', () => {
    expect(sanitizeRichText('')).toBe('');
    expect(sanitizeRichText(null)).toBe('');
    expect(sanitizeRichText(undefined)).toBe('');
  });

  it('keeps the code-block markup the editor produces', () => {
    const html =
      '<pre class="rte-code-block" data-language="c" data-block-id="1">' +
      '<code><span class="tok" data-line="1">int x;</span></code></pre>';
    const out = sanitizeRichText(html);
    expect(out).toContain('class="rte-code-block"');
    expect(out).toContain('data-language="c"');
    expect(out).toContain('data-block-id="1"');
    expect(out).toContain('data-line="1"');
    expect(out).toContain('int x;');
  });

  it('keeps ordinary formatting', () => {
    const out = sanitizeRichText('<p>a <strong>b</strong> <em>c</em></p><ul><li>d</li></ul>');
    expect(out).toBe('<p>a <strong>b</strong> <em>c</em></p><ul><li>d</li></ul>');
  });

  it('drops a script element and its content', () => {
    const out = sanitizeRichText('<p>ok</p><script>alert(1)</script>');
    expect(out).toContain('ok');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
  });

  it('strips inline event handlers but keeps the element', () => {
    const out = sanitizeRichText('<p><span onclick="alert(1)" class="x">hi</span></p>');
    expect(out).toContain('hi');
    expect(out).toContain('class="x"');
    expect(out).not.toContain('onclick');
  });

  it('drops the src/onerror image vector entirely', () => {
    const out = sanitizeRichText('<img src="x" onerror="alert(1)">text');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('<img');
    expect(out).toContain('text');
  });

  it('removes a javascript: href but keeps a safe one', () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
    expect(sanitizeRichText('<a href="https://example.com">x</a>')).toContain('href="https://example.com"');
  });

  it('strips inline styles', () => {
    const out = sanitizeRichText('<p style="background:url(https://evil/x)">x</p>');
    expect(out).not.toContain('style');
    expect(out).toContain('x');
  });

  it('unwraps an unknown tag but keeps its text', () => {
    const out = sanitizeRichText('<marquee>scroll</marquee>');
    expect(out).not.toContain('marquee');
    expect(out).toContain('scroll');
  });
});
