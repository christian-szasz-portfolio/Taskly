import { vi, type MockInstance } from 'vitest';
import { EventBus } from './event-bus.utility';
import { TITLE_EVENT_NAME } from '../constants/global.constants';

describe('event-bus.utility', () => {
  describe('TITLE_EVENT_NAME', () => {
    it('should be titleChange', () => {
      expect(TITLE_EVENT_NAME).toBe('titleChange');
    });
  });

  describe('dispatchTaskTitle', () => {
    let dispatchEventSpy: MockInstance;

    beforeEach(() => {
      dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    });

    it('should dispatch a CustomEvent with the area as detail', () => {
      EventBus.send(TITLE_EVENT_NAME, 'Kanban Board');

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls.at(-1)?.[0] as CustomEvent<string>;
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe(TITLE_EVENT_NAME);
      expect(event.detail).toBe('Kanban Board');
    });

    it('should dispatch area as-is without trimming', () => {
      EventBus.send(TITLE_EVENT_NAME, '  Dashboard  ');

      const event = dispatchEventSpy.mock.calls.at(-1)?.[0] as CustomEvent<string>;
      expect(event.detail).toBe('  Dashboard  ');
    });

    it('should dispatch null area as null', () => {
      EventBus.send(TITLE_EVENT_NAME, null as unknown as string);

      const event = dispatchEventSpy.mock.calls.at(-1)?.[0] as CustomEvent<string>;
      expect(event.detail).toBeNull();
    });

    it('should dispatch undefined area as null (CustomEvent converts undefined to null)', () => {
      EventBus.send(TITLE_EVENT_NAME, undefined as unknown as string);

      const event = dispatchEventSpy.mock.calls.at(-1)?.[0] as CustomEvent<string>;
      expect(event.detail).toBeNull();
    });

    it('should dispatch empty string for empty area', () => {
      EventBus.send(TITLE_EVENT_NAME, '');

      const event = dispatchEventSpy.mock.calls.at(-1)?.[0] as CustomEvent<string>;
      expect(event.detail).toBe('');
    });
  });
});
