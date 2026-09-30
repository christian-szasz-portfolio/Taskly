/**
 * Event bus utility for dispatching events across the application.
 */
export class EventBus {

  /** Dispatches a custom event with the given name and optional message.
   * @param eventName The name of the event to dispatch.
   * @param eventMessage Optional message to include in the event detail.
   */
  public static send<T>(eventName: Readonly<string>, eventMessage: Readonly<T>, bubbles?: boolean, cancelable?: boolean, composed?: boolean): void {
    const customEventInit: Readonly<CustomEventInit<T>> = {
      bubbles: bubbles ?? true,
      cancelable: cancelable ?? false,
      composed: composed ?? false,
      detail: eventMessage,
    };

    const event = new CustomEvent<T>(eventName, customEventInit);

    window.dispatchEvent(event);
  }
}
