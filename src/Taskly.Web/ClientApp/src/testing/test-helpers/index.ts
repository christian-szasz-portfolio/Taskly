// =============================================================================
// Test Helpers Barrel Export
// =============================================================================
// Import all test helpers with: import { createDialogMock, createTaskNavigationMock } from '@testing/test-helpers';

// Spy helpers (native Vitest)
export {
  createSpyObj,
  createSpy,
  spyOn,
  fail,
  type MockedObject,
  type MockFn,
  type MethodNames,
  type PropertyNames
} from './spy.helpers';

// Dialog helpers
export {
  createDialogMock,
  createDialogMockWithResult,
  createCancelDialogMock,
  updateDialogMockResult,
  type DialogMockResult,
  type MockDialog,
  type MockDialogRef
} from './dialog.helpers';

// Navigation helpers
export {
  createTaskNavigationMock,
  createActivatedRouteMock,
  createRouterMock,
  type ActivatedRouteMockOptions,
  type ActivatedRouteMockResult
} from './navigation.helpers';

// HTTP helpers
export {
  flushHttpRequests,
  expectHttpRequest,
  expectGet,
  expectPost,
  expectPut,
  expectPatch,
  expectDelete,
  flushInitialTaskList,
  flushSubtaskBatchRequest,
  flushAttachmentRequest,
  ApiEndpoints
} from './http.helpers';

// Provider helpers
export {
  getBaseTestProviders,
  getServerTestProviders,
  getFormTestProviders,
  getDialogTestProviders,
  createLocalStorageMock,
  createSessionStorageMock
} from './providers.helpers';
