import type { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class TaskRouteReuseStrategy implements RouteReuseStrategy {
  public shouldDetach(): boolean {
    return false;
  }

  public store(): void {
    return;
  }

  public shouldAttach(): boolean {
    return false;
  }

  public retrieve(): DetachedRouteHandle | null {
    return null;
  }

  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr?: ActivatedRouteSnapshot | null): boolean {
    if (this.isTaskDetailRoute(future) && this.isTaskDetailRoute(curr)) {
      return true;
    }

    return future.routeConfig === curr?.routeConfig;
  }

  private isTaskDetailRoute(route?: ActivatedRouteSnapshot | null): boolean {
    return route?.routeConfig?.data?.['reuseKey'] === 'task-detail';
  }
}
