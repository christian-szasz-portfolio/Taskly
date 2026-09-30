import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import {
  DEMO_COLLECTION_KEYS,
  DEMO_SEED_VERSION,
  DEMO_SEED_VERSION_KEY,
  DemoHydrationService,
} from './demo-hydration.service';
import { DEMO_STORE_PREFIX, DemoDataService } from './demo-data.service';
import { environment } from '../../../../environments/environment';

describe('DemoHydrationService', () => {
  let service: DemoHydrationService;
  let httpMock: HttpTestingController;
  let demoData: DemoDataService;

  const seedUrl = `${environment.apiBaseUrl}/demo/seed`;

  const seedResponse = {
    projects: [{ id: 'p1', key: 'DEMO', status: 'Active', title: 'Demo Project' }],
    taskItems: [{ id: 't1', title: 'Epic', variant: 'Epic', projectId: 'p1' }],
    subtasks: [{ id: 's1', title: 'Sub', parentTaskItemId: 't1' }],
    timeEntries: [{ id: 'te1' }],
    comments: [],
    notifications: [{ id: 'n1', title: 'Hi' }],
    systemTasks: [{ id: 'st1', name: 'Synced', state: 'Started' }],
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DemoHydrationService);
    httpMock = TestBed.inject(HttpTestingController);
    demoData = TestBed.inject(DemoDataService);
  });

  afterEach(() => httpMock.verify());

  it('fetches the seed and writes every collection, mapping variant to issueType', async () => {
    const arm = vi.spyOn(demoData, 'armLossDetection');
    const promise = firstValueFrom(service.ensureHydrated());

    const req = httpMock.expectOne(seedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(seedResponse);
    await promise;

    expect(arm).toHaveBeenCalled();

    expect(demoData.readCollection(DEMO_COLLECTION_KEYS.taskItems, () => [])).toEqual([
      { id: 't1', title: 'Epic', issueType: 'Epic', projectId: 'p1' },
    ]);
    expect(demoData.readCollection(DEMO_COLLECTION_KEYS.projects, () => [])).toHaveLength(1);
    expect(demoData.readCollection(DEMO_COLLECTION_KEYS.subtasks, () => [])).toHaveLength(1);
    expect(demoData.readCollection(DEMO_COLLECTION_KEYS.systemTasks, () => [])).toHaveLength(1);
    expect(localStorage.getItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.notifications}`)).not.toBeNull();
    expect(localStorage.getItem(DEMO_SEED_VERSION_KEY)).toBe(DEMO_SEED_VERSION);
  });

  it('skips fetching when data is present and the seed version matches', async () => {
    demoData.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'existing' }]);
    localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
    const arm = vi.spyOn(demoData, 'armLossDetection');

    await firstValueFrom(service.ensureHydrated());

    httpMock.expectNone(seedUrl);
    expect(arm).toHaveBeenCalled();
  });

  it('re-hydrates stale data when the seed version is outdated', async () => {
    demoData.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'old' }]);
    localStorage.setItem(DEMO_SEED_VERSION_KEY, '1');

    const promise = firstValueFrom(service.ensureHydrated());
    httpMock.expectOne(seedUrl).flush(seedResponse);
    await promise;

    const projects = demoData.readCollection<{ id: string }>(DEMO_COLLECTION_KEYS.projects, () => []);
    expect(projects).toEqual([{ id: 'p1', key: 'DEMO', status: 'Active', title: 'Demo Project' }]);
    expect(localStorage.getItem(DEMO_SEED_VERSION_KEY)).toBe(DEMO_SEED_VERSION);
  });
});
