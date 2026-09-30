/**
 * Cleans rich-text HTML before it is rendered, so a description edited into the demo (or tampered
 * with in storage) cannot inject active content. Angular's own sanitizer would strip the code-block
 * markup the editor relies on, so this keeps that markup and removes only what is dangerous: an
 * allow-list of tags and attributes, with scripts, event handlers, inline styles and unsafe URLs
 * dropped. The Content Security Policy already blocks inline script execution; this is the second
 * layer, so a bad string is inert even before the browser refuses it.
 */

/** Tags kept as they are. Anything else is unwrapped to its text; the content survives, the tag does not. */
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'DIV', 'SPAN', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'SUB', 'SUP',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'A', 'HR',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
]);

/** Tags dropped whole, content included: never safe to keep, not even as text. */
const FORBIDDEN_TAGS = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'TITLE',
  'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'OPTION', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH',
]);

/** Attributes kept on an allowed tag. Every other attribute, including every on* handler, is removed. */
const ALLOWED_ATTRS = new Set([
  'class', 'data-language', 'data-block-id', 'data-line', 'spellcheck', 'href', 'title',
]);

/** Schemes an href may use; javascript:, data: and the rest are dropped. */
const SAFE_URL = /^(?:https?:|mailto:)/i;

/** Returns the input with everything outside the allow-list removed. Safe to render as HTML. */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) {
    return '';
  }

  // No parser (e.g. server prerender): fall back to text only, which is always safe.
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  cleanChildren(doc.body);
  return doc.body.innerHTML;
}

/** Cleans every element under `parent`, depth first, so unwrapping moves already-clean nodes up. */
function cleanChildren(parent: Element): void {
  // A static copy: the live collection changes as elements are removed or unwrapped.
  for (const element of Array.from(parent.children)) {
    const tag = element.tagName.toUpperCase();

    if (FORBIDDEN_TAGS.has(tag)) {
      element.remove();
      continue;
    }

    cleanChildren(element);

    if (!ALLOWED_TAGS.has(tag)) {
      unwrap(element);
      continue;
    }

    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const disallowed = !ALLOWED_ATTRS.has(name);
      const unsafeHref = name === 'href' && !SAFE_URL.test(attr.value.trim());
      if (disallowed || unsafeHref) {
        element.removeAttribute(attr.name);
      }
    }
  }
}

/** Replaces an element with its (already-cleaned) children, keeping their text and markup. */
function unwrap(element: Element): void {
  const parent = element.parentNode;
  if (parent === null) {
    return;
  }
  while (element.firstChild !== null) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}
