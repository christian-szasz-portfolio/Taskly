export type HeightChangeCallback = (height: number) => void;
export type HeightObserverCleanup = () => void;

/**
 * Observes the rendered height of an element and notifies the callback whenever it changes.
 * Falls back to a single synchronous measurement if ResizeObserver is unavailable.
 */
export function observeElementHeight(element: HTMLElement, callback: HeightChangeCallback): HeightObserverCleanup {
  if (!element) {
    return () => undefined;
  }

  const emitHeight = (): void => {
    const rect = element.getBoundingClientRect();
    callback(Math.round(rect.height));
  };

  if (typeof ResizeObserver === 'undefined') {
    emitHeight();
    return () => undefined;
  }

  const observer = new ResizeObserver(() => emitHeight());
  observer.observe(element);
  emitHeight();

  return () => observer.disconnect();
}
