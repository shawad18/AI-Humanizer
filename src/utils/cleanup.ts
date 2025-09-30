// Global cleanup utility to prevent memory leaks

/**
 * Cleanup all services to prevent memory leaks
 * This should be called during test teardown or app shutdown
 */
export const cleanupAllServices = async (): Promise<void> => {
  try {
    // Use dynamic imports to avoid executing service constructors at module load time
    const [
      { securityService },
      { analyticsService },
      { humanizationEngine },
      { websocketService }
    ] = await Promise.all([
      import('../services/securityService'),
      import('../services/analyticsService'),
      import('../services/humanizationEngine'),
      import('../services/websocketService')
    ]);

    // Cleanup security service timers
    if (securityService && typeof securityService.cleanup === 'function') {
      securityService.cleanup();
    }

    // Cleanup analytics service timers
    if (analyticsService && typeof analyticsService.cleanup === 'function') {
      analyticsService.cleanup();
    }

    // Cleanup humanization engine timers
    if (humanizationEngine && typeof humanizationEngine.cleanup === 'function') {
      humanizationEngine.cleanup();
    }

    // Cleanup websocket connections
    if (websocketService && typeof websocketService.disconnect === 'function') {
      websocketService.disconnect();
    }

    console.log('All services cleaned up successfully');
  } catch (error) {
    console.warn('Error during service cleanup:', error);
  }
};

/**
 * Setup cleanup for test environment
 * This ensures cleanup happens after each test
 */
export const setupTestCleanup = (): void => {
  if (typeof afterEach !== 'undefined') {
    afterEach(async () => {
      await cleanupAllServices();
    });
  }

  if (typeof afterAll !== 'undefined') {
    afterAll(async () => {
      await cleanupAllServices();
    });
  }
};