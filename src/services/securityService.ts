// Enhanced Security Service with Rate Limiting, Encryption, and Audit Logging
import CryptoJS from 'crypto-js';
import { apiClient } from './apiClient';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAlert {
  id: string;
  type: 'rate_limit_exceeded' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  userId?: string;
  ipAddress: string;
  details: any;
}

export interface APIKeyInfo {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: RateLimitConfig;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  expiresAt?: string;
}

class SecurityService {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  initialize(): void {
    console.log('Security service initialized');
    // Implementation will be added later
  }
  
  private setupCSPHeaders(): void {
    console.log('CSP headers setup');
  }
  
  private monitorForSuspiciousActivity(): void {
    console.log('Monitoring for suspicious activity');
  }
  private auditLogs: AuditLogEntry[] = [];
  private securityAlerts: SecurityAlert[] = [];
  private encryptionKey: string;
  private apiKeys: Map<string, APIKeyInfo> = new Map();

  constructor() {
    this.encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.initializeDefaultRateLimits();
    this.startCleanupInterval();
  }

  private initializeDefaultRateLimits() {
    // Default rate limits for different endpoints
    this.setRateLimit('humanize', { windowMs: 60000, maxRequests: 10 });
    this.setRateLimit('detect', { windowMs: 60000, maxRequests: 20 });
    this.setRateLimit('export', { windowMs: 300000, maxRequests: 5 });
    this.setRateLimit('upload', { windowMs: 60000, maxRequests: 3 });
  }

  private startCleanupInterval() {
    // Clean up expired rate limit entries every 5 minutes
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of Array.from(this.rateLimitStore.entries())) {
        if (now > data.resetTime) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  public cleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.rateLimitStore.clear();
  }

  // Rate Limiting
  public checkRateLimit(
    identifier: string, 
    endpoint: string, 
    customConfig?: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `${identifier}:${endpoint}`;
    const config = customConfig || this.getRateLimitConfig(endpoint);
    const now = Date.now();
    
    let rateLimitData = this.rateLimitStore.get(key);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }

    const allowed = rateLimitData.count < config.maxRequests;
    
    if (allowed) {
      rateLimitData.count++;
      this.rateLimitStore.set(key, rateLimitData);
    } else {
      this.logSecurityAlert({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        message: `Rate limit exceeded for ${endpoint}`,
        ipAddress: identifier,
        details: { endpoint, count: rateLimitData.count, limit: config.maxRequests }
      });
    }

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - rateLimitData.count),
      resetTime: rateLimitData.resetTime
    };
  }

  private getRateLimitConfig(endpoint: string): RateLimitConfig {
    const defaultConfigs: Record<string, RateLimitConfig> = {
      humanize: { windowMs: 60000, maxRequests: 10 },
      detect: { windowMs: 60000, maxRequests: 20 },
      export: { windowMs: 300000, maxRequests: 5 },
      upload: { windowMs: 60000, maxRequests: 3 },
      default: { windowMs: 60000, maxRequests: 100 }
    };

    return defaultConfigs[endpoint] || defaultConfigs.default;
  }

  public setRateLimit(endpoint: string, config: RateLimitConfig): void {
    // This would typically be stored in a database
    localStorage.setItem(`rateLimit:${endpoint}`, JSON.stringify(config));
  }

  // Content Encryption
  public encryptContent(content: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(content, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt content');
    }
  }

  public decryptContent(encryptedContent: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt content');
    }
  }

  public hashSensitiveData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  // API Key Management
  public async generateAPIKey(
    name: string, 
    permissions: string[], 
    rateLimit?: RateLimitConfig,
    expiresIn?: number
  ): Promise<APIKeyInfo> {
    const apiKey: APIKeyInfo = {
      id: this.generateId(),
      name,
      key: this.generateSecureKey(),
      permissions,
      rateLimit: rateLimit || { windowMs: 60000, maxRequests: 100 },
      isActive: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn).toISOString() : undefined
    };

    this.apiKeys.set(apiKey.id, apiKey);
    
    this.logAuditEntry({
      action: 'api_key_created',
      resource: 'api_keys',
      details: { keyId: apiKey.id, name, permissions },
      riskLevel: 'medium'
    });

    return apiKey;
  }

  public validateAPIKey(key: string): { valid: boolean; keyInfo?: APIKeyInfo; error?: string } {
    for (const [, keyInfo] of Array.from(this.apiKeys.entries())) {
      if (keyInfo.key === key) {
        if (!keyInfo.isActive) {
          return { valid: false, error: 'API key is inactive' };
        }
        
        if (keyInfo.expiresAt && new Date() > new Date(keyInfo.expiresAt)) {
          return { valid: false, error: 'API key has expired' };
        }

        // Update usage
        keyInfo.lastUsed = new Date().toISOString();
        keyInfo.usageCount++;
        
        return { valid: true, keyInfo };
      }
    }
    
    return { valid: false, error: 'Invalid API key' };
  }

  public revokeAPIKey(keyId: string): boolean {
    const keyInfo = this.apiKeys.get(keyId);
    if (keyInfo) {
      keyInfo.isActive = false;
      this.logAuditEntry({
        action: 'api_key_revoked',
        resource: 'api_keys',
        details: { keyId },
        riskLevel: 'medium'
      });
      return true;
    }
    return false;
  }

  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ak_'; // API key prefix
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Audit Logging
  public logAuditEntry(entry: Partial<AuditLogEntry>): void {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      userId: entry.userId || 'anonymous',
      action: entry.action || 'unknown',
      resource: entry.resource || 'unknown',
      timestamp: new Date().toISOString(),
      ipAddress: entry.ipAddress || this.getClientIP(),
      userAgent: entry.userAgent || navigator.userAgent,
      success: entry.success !== false,
      details: entry.details,
      riskLevel: entry.riskLevel || 'low'
    };

    this.auditLogs.push(auditEntry);
    
    // Keep only last 1000 entries in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    // Send to backend for persistent storage
    this.sendAuditLogToBackend(auditEntry);
  }

  private async sendAuditLogToBackend(entry: AuditLogEntry): Promise<void> {
    try {
      await apiClient.post('/security/audit-log', entry);
    } catch (error) {
      console.error('Failed to send audit log to backend:', error);
    }
  }

  public getAuditLogs(
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      riskLevel?: string;
      startDate?: string;
      endDate?: string;
    }
  ): AuditLogEntry[] {
    let logs = [...this.auditLogs];

    if (filters) {
      logs = logs.filter(log => {
        if (filters.userId && log.userId !== filters.userId) return false;
        if (filters.action && log.action !== filters.action) return false;
        if (filters.resource && log.resource !== filters.resource) return false;
        if (filters.riskLevel && log.riskLevel !== filters.riskLevel) return false;
        if (filters.startDate && log.timestamp < filters.startDate) return false;
        if (filters.endDate && log.timestamp > filters.endDate) return false;
        return true;
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Security Alerts
  public logSecurityAlert(alert: Partial<SecurityAlert>): void {
    const securityAlert: SecurityAlert = {
      id: this.generateId(),
      type: alert.type || 'suspicious_activity',
      severity: alert.severity || 'medium',
      message: alert.message || 'Security event detected',
      timestamp: new Date().toISOString(),
      userId: alert.userId,
      ipAddress: alert.ipAddress || this.getClientIP(),
      details: alert.details || {}
    };

    this.securityAlerts.push(securityAlert);

    // Auto-escalate critical and high severity alerts
    if (securityAlert.severity === 'critical') {
      this.escalateAlert(securityAlert);
    } else if (securityAlert.severity === 'high') {
      console.warn('HIGH SECURITY ALERT:', securityAlert);
    }

    // Send to backend
    this.sendSecurityAlertToBackend(securityAlert);
  }

  private async sendSecurityAlertToBackend(alert: SecurityAlert): Promise<void> {
    try {
      await apiClient.post('/security/alerts', alert);
    } catch (error) {
      console.error('Failed to send security alert to backend:', error);
    }
  }

  private escalateAlert(alert: SecurityAlert): void {
    // In a real application, this would notify administrators
    console.warn('CRITICAL SECURITY ALERT:', alert);
    
    // Could send email, SMS, or push notifications
    this.logAuditEntry({
      action: 'security_alert_escalated',
      resource: 'security',
      details: { alertId: alert.id, type: alert.type },
      riskLevel: 'critical'
    });
  }

  public getSecurityAlerts(severity?: string): SecurityAlert[] {
    let alerts = [...this.securityAlerts];
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Content Sanitization
  public sanitizeInput(input: string): string {
    // Remove potentially dangerous characters and scripts
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  public validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds limit' };
    }

    return { valid: true };
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getClientIP(): string {
    // In a real application, this would be provided by the backend
    return 'client-ip-placeholder';
  }

  public getSecurityMetrics(): any {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);

    const recentLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp).getTime() > last24Hours
    );

    const recentAlerts = this.securityAlerts.filter(alert => 
      new Date(alert.timestamp).getTime() > last24Hours
    );

    return {
      totalAuditLogs: this.auditLogs.length,
      recentAuditLogs: recentLogs.length,
      totalSecurityAlerts: this.securityAlerts.length,
      recentSecurityAlerts: recentAlerts.length,
      activeAPIKeys: Array.from(this.apiKeys.values()).filter(key => key.isActive).length,
      riskLevelDistribution: {
        low: recentLogs.filter(log => log.riskLevel === 'low').length,
        medium: recentLogs.filter(log => log.riskLevel === 'medium').length,
        high: recentLogs.filter(log => log.riskLevel === 'high').length,
        critical: recentLogs.filter(log => log.riskLevel === 'critical').length
      },
      alertSeverityDistribution: {
        low: recentAlerts.filter(alert => alert.severity === 'low').length,
        medium: recentAlerts.filter(alert => alert.severity === 'medium').length,
        high: recentAlerts.filter(alert => alert.severity === 'high').length,
        critical: recentAlerts.filter(alert => alert.severity === 'critical').length
      }
    };
  }
}

export const securityService = new SecurityService();
export default securityService;