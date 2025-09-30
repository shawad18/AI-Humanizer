// API Configuration for Backend Integration
export const API_CONFIG = {
  // Development environment
  DEV: {
    BASE_URL: 'http://localhost:8000/api',
    WS_URL: 'ws://localhost:8000/ws',
    TIMEOUT: 30000,
  },
  // Production environment
  PROD: {
    BASE_URL: 'https://api.ai-humanizer.com/api',
    WS_URL: 'wss://api.ai-humanizer.com/ws',
    TIMEOUT: 30000,
  },
  // Current environment
  get CURRENT() {
    return process.env.NODE_ENV === 'production' ? this.PROD : this.DEV;
  }
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // AI Services
  AI: {
    HUMANIZE: '/ai/humanize',
    DETECT: '/ai/detect',
    BATCH_PROCESS: '/ai/batch',
    MODELS: '/ai/models',
    USAGE: '/ai/usage',
  },
  
  // Documents
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    GET: '/documents/:id',
    UPDATE: '/documents/:id',
    DELETE: '/documents/:id',
    SHARE: '/documents/:id/share',
    COLLABORATE: '/documents/:id/collaborate',
  },
  
  // Real-time collaboration
  COLLABORATION: {
    JOIN_ROOM: '/collaboration/join',
    LEAVE_ROOM: '/collaboration/leave',
    SYNC: '/collaboration/sync',
    CURSORS: '/collaboration/cursors',
  },
  
  // Analytics
  ANALYTICS: {
    USAGE: '/analytics/usage',
    PERFORMANCE: '/analytics/performance',
    USER_BEHAVIOR: '/analytics/behavior',
    REPORTS: '/analytics/reports',
  },
  
  // Payments
  PAYMENTS: {
    PLANS: '/payments/plans',
    SUBSCRIBE: '/payments/subscribe',
    BILLING: '/payments/billing',
    USAGE_BILLING: '/payments/usage',
    INVOICES: '/payments/invoices',
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
    SYSTEM: '/admin/system',
    AUDIT_LOGS: '/admin/audit',
  }
};

// Request configuration
export const REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: API_CONFIG.CURRENT.TIMEOUT,
};

// WebSocket configuration
export const WS_CONFIG = {
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
};