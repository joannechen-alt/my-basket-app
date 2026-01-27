/**
 * Test Fixtures and Factories
 * 
 * This directory contains reusable test data and mock objects for unit testing.
 * 
 * Files:
 * - products.fixture.ts: Product test data and factory functions
 * - mocks.fixture.ts: Mock implementations of service clients
 * 
 * Usage:
 * Import fixtures in your test files:
 * 
 * ```typescript
 * import { mockProducts, createMockProduct } from './__fixtures__/products.fixture';
 * import { createMockProductClient } from './__fixtures__/mocks.fixture';
 * ```
 * 
 * Benefits:
 * - Single source of truth for test data
 * - Reusable across all test files
 * - Easy to maintain and update
 * - Follows Test Data Builder pattern
 */

export * from './products.fixture';
export * from './mocks.fixture';
