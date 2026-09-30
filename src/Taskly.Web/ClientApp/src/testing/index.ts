// =============================================================================
// Testing Utilities Barrel Export
// =============================================================================
// Main entry point for all testing utilities
//
// Configure path mapping in tsconfig.spec.json:
// {
//   "compilerOptions": {
//     "paths": {
//       "@testing/*": ["src/testing/*"]
//     }
//   }
// }
//
// Then import with:
// import { createMockTask, createDialogMock, getBaseTestProviders } from '@testing';

// Re-export all mock factories
export * from './mock-factories';

// Re-export all test helpers
export * from './test-helpers';
