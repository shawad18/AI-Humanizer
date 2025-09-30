// Advanced Analytics Service for Usage Patterns, Performance Metrics, and A/B Testing
import { apiClient } from './apiClient';

export interface UserBehaviorEvent {
  eventType: 'page_view' | 'button_click' | 'text_input' | 'export' | 'humanize' | 'ai_detect' | 'error';
  eventData: {
    page?: string;
    component?: string;
    action?: string;
    value?: any;
    timestamp: number;
    sessionId: string;
    userId?: string;
  };
  metadata?: {
    userAgent?: string;
    screenResolution?: string;
    deviceType?: 'desktop' | 'tablet' | 'mobile';
    connectionType?: string;
    location?: string;
  };
}

export interface PerformanceMetric {
  metricType: 'page_load' | 'api_response' | 'humanization_time' | 'export_time' | 'ai_detection_time';
  value: number;
  timestamp: number;
  metadata?: {
    endpoint?: string;
    fileSize?: number;
    textLength?: number;
    modelUsed?: string;
    cacheHit?: boolean;
  };
}

export interface UsagePattern {
  userId?: string;
  sessionId: string;
  patterns: {
    mostUsedFeatures: Array<{ feature: string; count: number }>;
    averageSessionDuration: number;
    peakUsageHours: number[];
    preferredExportFormats: Array<{ format: string; count: number }>;
    humanizationFrequency: number;
    errorRate: number;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ABTestConfig {
  testId: string;
  testName: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number; // Percentage of users to show this variant
    config: any; // Configuration for this variant
  }>;
  targetMetric: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface ABTestResult {
  testId: string;
  variant: string;
  userId?: string;
  sessionId: string;
  conversionEvent: string;
  conversionValue?: number;
  timestamp: Date;
}

export interface AnalyticsDashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    totalHumanizations: number;
    totalExports: number;
    errorRate: number;
  };
  usage: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    featureUsage: Array<{ feature: string; count: number; percentage: number }>;
    exportFormats: Array<{ format: string; count: number; percentage: number }>;
    deviceTypes: Array<{ type: string; count: number; percentage: number }>;
  };
  performance: {
    averageResponseTimes: Array<{ endpoint: string; avgTime: number }>;
    humanizationPerformance: Array<{ model: string; avgTime: number; successRate: number }>;
    errorsByType: Array<{ type: string; count: number }>;
    systemHealth: {
      uptime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
  abTests: Array<{
    testId: string;
    testName: string;
    status: 'active' | 'completed' | 'paused';
    variants: Array<{
      id: string;
      name: string;
      conversions: number;
      conversionRate: number;
      significance: number;
    }>;
  }>;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private eventQueue: UserBehaviorEvent[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private abTestAssignments: Map<string, string> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
    this.startPerformanceMonitoring();
    this.setupEventListeners();
  }

  public initialize(): void {
    // Public initialize method for external initialization
    this.initializeAnalytics();
  }

  // Initialize analytics
  private initializeAnalytics(): void {
    // Start batch processing
    this.flushTimer = setInterval(() => {
      this.flushEvents();
      this.flushPerformanceMetrics();
    }, this.flushInterval);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('page_view', {
        action: document.hidden ? 'page_hidden' : 'page_visible',
        page: window.location.pathname
      });
    });

    // Track initial page load
    this.trackEvent('page_view', {
      page: window.location.pathname,
      action: 'initial_load'
    });
  }

  // Set user ID for tracking
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  // Cleanup method to prevent memory leaks
  public cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // Flush any remaining events before cleanup
    this.flushEvents();
    this.flushPerformanceMetrics();
    this.eventQueue = [];
    this.performanceQueue = [];
  }

  // Track user behavior events
  public trackEvent(
    eventType: UserBehaviorEvent['eventType'],
    eventData: Partial<UserBehaviorEvent['eventData']>,
    metadata?: UserBehaviorEvent['metadata']
  ): void {
    const event: UserBehaviorEvent = {
      eventType,
      eventData: {
        ...eventData,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId
      },
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType()
      }
    };

    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (eventType === 'error') {
      this.flushEvents();
    }
  }

  // Track performance metrics
  public trackPerformance(
    metricType: PerformanceMetric['metricType'],
    value: number,
    metadata?: PerformanceMetric['metadata']
  ): void {
    const metric: PerformanceMetric = {
      metricType,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.performanceQueue.push(metric);
  }

  // Track API performance
  public trackApiPerformance(endpoint: string, startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;
    this.trackPerformance('api_response', duration, {
      endpoint,
      cacheHit: false
    });

    if (!success) {
      this.trackEvent('error', {
        action: 'api_error',
        value: { endpoint, duration }
      });
    }
  }

  // Track humanization performance
  public trackHumanizationPerformance(
    textLength: number,
    modelUsed: string,
    startTime: number,
    success: boolean
  ): void {
    const duration = Date.now() - startTime;
    this.trackPerformance('humanization_time', duration, {
      textLength,
      modelUsed
    });

    this.trackEvent('humanize', {
      action: success ? 'success' : 'failure',
      value: { textLength, modelUsed, duration }
    });
  }

  // Track export performance
  public trackExportPerformance(
    format: string,
    fileSize: number,
    startTime: number,
    success: boolean
  ): void {
    const duration = Date.now() - startTime;
    this.trackPerformance('export_time', duration, {
      fileSize
    });

    this.trackEvent('export', {
      action: success ? 'success' : 'failure',
      value: { format, fileSize, duration }
    });
  }

  // A/B Testing functionality
  public async getABTestVariant(testId: string): Promise<string | null> {
    try {
      // Check if user already has an assignment
      if (this.abTestAssignments.has(testId)) {
        return this.abTestAssignments.get(testId)!;
      }

      // Get test configuration
      const response = await apiClient.get(`/analytics/ab-tests/${testId}`);
      const testConfig: ABTestConfig = response.data as ABTestConfig;

      if (!testConfig.isActive) {
        return null;
      }

      // Assign variant based on user ID or session ID
      const assignmentKey = this.userId || this.sessionId;
      const variant = this.assignVariant(testConfig, assignmentKey);
      
      this.abTestAssignments.set(testId, variant);

      // Track assignment
      this.trackEvent('button_click', {
        action: 'ab_test_assignment',
        value: { testId, variant }
      });

      return variant;
    } catch (error) {
      console.error('Failed to get A/B test variant:', error);
      return null;
    }
  }

  // Track A/B test conversion
  public trackConversion(testId: string, conversionEvent: string, conversionValue?: number): void {
    const variant = this.abTestAssignments.get(testId);
    if (!variant) return;

    const result: ABTestResult = {
      testId,
      variant,
      userId: this.userId,
      sessionId: this.sessionId,
      conversionEvent,
      conversionValue,
      timestamp: new Date()
    };

    // Send conversion immediately
    apiClient.post('/analytics/ab-tests/conversions', result).catch(error => {
      console.error('Failed to track conversion:', error);
    });

    this.trackEvent('button_click', {
      action: 'ab_test_conversion',
      value: { testId, variant, conversionEvent, conversionValue }
    });
  }

  // Get analytics dashboard data
  public async getDashboardData(timeRange?: { start: Date; end: Date }): Promise<AnalyticsDashboardData> {
    try {
      const params = timeRange ? {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      } : {};

      const response = await apiClient.get('/analytics/dashboard', { params });
      return response.data as any;
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  // Get usage patterns
  public async getUsagePatterns(userId?: string, timeRange?: { start: Date; end: Date }): Promise<UsagePattern> {
    try {
      const params = {
        userId,
        ...timeRange && {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        }
      };

      const response = await apiClient.get('/analytics/usage-patterns', { params });
      return response.data as any;
    } catch (error) {
      console.error('Failed to get usage patterns:', error);
      throw error;
    }
  }

  // Create A/B test
  public async createABTest(config: Omit<ABTestConfig, 'testId'>): Promise<string> {
    try {
      const response = await apiClient.post('/analytics/ab-tests', config);
      return (response.data as { testId: string }).testId;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      throw error;
    }
  }

  // Get A/B test results
  public async getABTestResults(testId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/ab-tests/${testId}/results`);
      return response.data as any;
    } catch (error) {
      console.error('Failed to get A/B test results:', error);
      throw error;
    }
  }

  // Performance monitoring
  private startPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries && navigationEntries.length > 0) {
        const navigation = navigationEntries[0] as PerformanceNavigationTiming;
        this.trackPerformance('page_load', navigation.loadEventEnd - navigation.fetchStart);
      }
    });

    // Monitor resource loading
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries && entries.length > 0) {
            for (const entry of entries) {
              if (entry.entryType === 'resource') {
                const resourceEntry = entry as PerformanceResourceTiming;
                this.trackPerformance('page_load', resourceEntry.duration, {
                  endpoint: resourceEntry.name
                });
              }
            }
          }
        });

        observer.observe({ entryTypes: ['resource'] });
      }
    } catch (error) {
      // PerformanceObserver not supported in test environment
      console.debug('PerformanceObserver not available:', error);
    }
  }

  // Setup event listeners for automatic tracking
  private setupEventListeners(): void {
    // Track clicks on buttons and links
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.trackEvent('button_click', {
          component: target.className,
          action: 'click',
          value: target.textContent?.trim()
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      this.trackEvent('button_click', {
        component: target.className,
        action: 'form_submit'
      });
    });

    // Track input focus (for engagement metrics)
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.trackEvent('text_input', {
          component: target.className,
          action: 'focus'
        });
      }
    }, true);

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        action: 'javascript_error',
        value: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', {
        action: 'unhandled_promise_rejection',
        value: {
          reason: event.reason?.toString()
        }
      });
    });
  }

  // Flush events to server
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = this.eventQueue.splice(0, this.batchSize);
    
    try {
      await apiClient.post('/analytics/events', { events });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  // Flush performance metrics to server
  private async flushPerformanceMetrics(): Promise<void> {
    if (this.performanceQueue.length === 0) return;

    const metrics = this.performanceQueue.splice(0, this.batchSize);
    
    try {
      await apiClient.post('/analytics/performance', { metrics });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      // Re-queue metrics on failure
      this.performanceQueue.unshift(...metrics);
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private assignVariant(testConfig: ABTestConfig, assignmentKey: string): string {
    // Simple hash-based assignment for consistent variant assignment
    let hash = 0;
    for (let i = 0; i < assignmentKey.length; i++) {
      const char = assignmentKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const normalizedHash = Math.abs(hash) % 100;
    let cumulativeWeight = 0;

    for (const variant of testConfig.variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash < cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return testConfig.variants[0].id;
  }

  // Public methods for manual tracking
  public trackPageView(page: string): void {
    this.trackEvent('page_view', { page, action: 'manual_track' });
  }

  public trackFeatureUsage(feature: string, action: string, value?: any): void {
    this.trackEvent('button_click', { component: feature, action, value });
  }

  public trackError(error: Error, context?: string): void {
    this.trackEvent('error', {
      action: 'manual_error',
      value: {
        message: error.message,
        stack: error.stack,
        context
      }
    });
  }

}

export const analyticsService = new AnalyticsService();
export default analyticsService;