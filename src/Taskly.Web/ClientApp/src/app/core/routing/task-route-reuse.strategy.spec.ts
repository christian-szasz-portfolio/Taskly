import type { ActivatedRouteSnapshot } from '@angular/router';
import { TaskRouteReuseStrategy } from './task-route-reuse.strategy';

describe('TaskRouteReuseStrategy', () => {
  let strategy: TaskRouteReuseStrategy;

  beforeEach(() => {
    strategy = new TaskRouteReuseStrategy();
  });

  describe('shouldDetach', () => {
    it('should always return false', () => {
      expect(strategy.shouldDetach()).toBe(false);
    });
  });

  describe('store', () => {
    it('should not throw', () => {
      expect(() => strategy.store()).not.toThrow();
    });
  });

  describe('shouldAttach', () => {
    it('should always return false', () => {
      expect(strategy.shouldAttach()).toBe(false);
    });
  });

  describe('retrieve', () => {
    it('should always return null', () => {
      expect(strategy.retrieve()).toBeNull();
    });
  });

  describe('shouldReuseRoute', () => {
    it('should reuse route when both are task-detail routes', () => {
      const future = createMockRoute({ reuseKey: 'task-detail' });
      const curr = createMockRoute({ reuseKey: 'task-detail' });

      expect(strategy.shouldReuseRoute(future, curr)).toBe(true);
    });

    it('should not reuse when future is task-detail but curr is not with different configs', () => {
      const future = createMockRoute({ reuseKey: 'task-detail' }, { path: 'future' });
      const curr = createMockRoute({ reuseKey: 'other' }, { path: 'curr' });

      // Different routeConfigs, so it should return false
      expect(strategy.shouldReuseRoute(future, curr)).toBe(false);
    });

    it('should use default comparison when neither are task-detail routes with same config', () => {
      const routeConfig = { path: 'test' };
      // Use same routeConfig object directly (no spread) to test reference equality
      const future = { routeConfig, data: {} } as unknown as ActivatedRouteSnapshot;
      const curr = { routeConfig, data: {} } as unknown as ActivatedRouteSnapshot;

      // Same routeConfig object reference, so it should return true
      expect(strategy.shouldReuseRoute(future, curr)).toBe(true);
    });

    it('should return false when routeConfigs differ', () => {
      const future = createMockRoute({}, { path: 'future' });
      const curr = createMockRoute({}, { path: 'curr' });

      expect(strategy.shouldReuseRoute(future, curr)).toBe(false);
    });

    it('should handle null curr route', () => {
      const future = createMockRoute({});

      expect(strategy.shouldReuseRoute(future, null)).toBe(false);
    });

    it('should handle undefined curr route', () => {
      const future = createMockRoute({});

      expect(strategy.shouldReuseRoute(future, undefined)).toBe(false);
    });

    it('should handle curr route without routeConfig', () => {
      const future = createMockRoute({}, { path: 'test' });
      const curr = { routeConfig: null } as unknown as ActivatedRouteSnapshot;

      expect(strategy.shouldReuseRoute(future, curr)).toBe(false);
    });
  });

  function createMockRoute(
    data: Record<string, unknown>,
    routeConfig: object | null = null
  ): ActivatedRouteSnapshot {
    return {
      routeConfig: routeConfig ? { ...routeConfig, data } : { data },
      data
    } as unknown as ActivatedRouteSnapshot;
  }
});
