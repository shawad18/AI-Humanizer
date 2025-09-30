// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Import cleanup utility to prevent memory leaks (after all mocks are set up)
import { setupTestCleanup } from './utils/cleanup';

// Mock PerformanceObserver for test environment FIRST
global.PerformanceObserver = class PerformanceObserver {
  private callback: any;
  
  constructor(callback: any) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
  
  static supportedEntryTypes = ['resource', 'navigation', 'measure', 'mark'];
};

// Mock performance.mark and performance.measure
global.performance.mark = jest.fn();
global.performance.measure = jest.fn();
global.performance.getEntriesByType = jest.fn(() => []);
global.performance.getEntriesByName = jest.fn(() => []);

// Mock crypto for test environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
});

// Mock IndexedDB for test environment
class MockIDBRequest {
  result: any = null;
  error: any = null;
  onsuccess: any = null;
  onerror: any = null;
  readyState: string = 'done';
  source: any = null;
  transaction: any = null;
  
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockIDBDatabase {
  name: string = 'test-db';
  version: number = 1;
  objectStoreNames: string[] = [];
  
  close() {}
  createObjectStore() { return new MockIDBObjectStore(); }
  deleteObjectStore() {}
  transaction() { return new MockIDBTransaction(); }
  
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockIDBObjectStore {
  name: string = 'test-store';
  keyPath: any = null;
  indexNames: string[] = [];
  autoIncrement: boolean = false;
  
  add() { return new MockIDBRequest(); }
  put() { return new MockIDBRequest(); }
  get() { return new MockIDBRequest(); }
  delete() { return new MockIDBRequest(); }
  clear() { return new MockIDBRequest(); }
  getAll() { return new MockIDBRequest(); }
  getAllKeys() { return new MockIDBRequest(); }
  count() { return new MockIDBRequest(); }
  openCursor() { return new MockIDBRequest(); }
  openKeyCursor() { return new MockIDBRequest(); }
  createIndex() { return new MockIDBIndex(); }
  deleteIndex() {}
  index() { return new MockIDBIndex(); }
}

class MockIDBTransaction {
  mode: string = 'readonly';
  db: any = new MockIDBDatabase();
  error: any = null;
  objectStoreNames: string[] = [];
  
  objectStore() { return new MockIDBObjectStore(); }
  abort() {}
  
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockIDBIndex {
  name: string = 'test-index';
  keyPath: any = null;
  unique: boolean = false;
  multiEntry: boolean = false;
  
  get() { return new MockIDBRequest(); }
  getAll() { return new MockIDBRequest(); }
  getAllKeys() { return new MockIDBRequest(); }
  count() { return new MockIDBRequest(); }
  openCursor() { return new MockIDBRequest(); }
  openKeyCursor() { return new MockIDBRequest(); }
}

// Set up global IndexedDB interfaces
Object.defineProperty(global, 'IDBRequest', { value: MockIDBRequest });
Object.defineProperty(global, 'IDBDatabase', { value: MockIDBDatabase });
Object.defineProperty(global, 'IDBObjectStore', { value: MockIDBObjectStore });
Object.defineProperty(global, 'IDBTransaction', { value: MockIDBTransaction });
Object.defineProperty(global, 'IDBIndex', { value: MockIDBIndex });

Object.defineProperty(global, 'indexedDB', {
  value: {
    open: jest.fn(() => {
      const request = new MockIDBRequest();
      request.result = new MockIDBDatabase();
      return request;
    }),
    deleteDatabase: jest.fn(() => new MockIDBRequest()),
    cmp: jest.fn(() => 0)
  }
});

// Mock window.matchMedia for test environment
const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Ensure global matchMedia is available
global.matchMedia = mockMatchMedia;

// Setup automatic cleanup for all tests
setupTestCleanup();
