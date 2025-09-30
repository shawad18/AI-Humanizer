// Automated Security Audit Scheduler
import { securityService } from './securityService';

export interface SecurityAuditConfig {
  enabled: boolean;
  intervalMinutes: number;
  auditTypes: string[];
  alertThresholds: {
    criticalAlerts: number;
    highRiskLogs: number;
    failedLogins: number;
  };
}

export interface ScheduledAuditResult {
  id: string;
  timestamp: Date;
  auditType: string;
  status: 'completed' | 'failed' | 'in_progress';
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  nextScheduledRun: Date;
}

class SecurityAuditScheduler {
  private config: SecurityAuditConfig;
  private auditTimer: NodeJS.Timeout | null = null;
  private auditHistory: ScheduledAuditResult[] = [];
  private isRunning = false;

  constructor() {
    this.config = {
      enabled: true,
      intervalMinutes: 60, // Run every hour
      auditTypes: [
        'authentication_check',
        'rate_limit_review',
        'security_alerts_analysis',
        'audit_log_review',
        'api_key_validation'
      ],
      alertThresholds: {
        criticalAlerts: 1,
        highRiskLogs: 5,
        failedLogins: 10
      }
    };
  }

  /**
   * Start the automated security audit scheduler
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Security audit scheduler is already running');
      return;
    }

    console.log('Starting automated security audit scheduler...');
    this.isRunning = true;

    // Run initial audit
    this.runScheduledAudit();

    // Schedule recurring audits
    this.auditTimer = setInterval(() => {
      this.runScheduledAudit();
    }, this.config.intervalMinutes * 60 * 1000);

    console.log(`Security audits scheduled to run every ${this.config.intervalMinutes} minutes`);
  }

  /**
   * Stop the automated security audit scheduler
   */
  public stop(): void {
    if (this.auditTimer) {
      clearInterval(this.auditTimer);
      this.auditTimer = null;
    }
    this.isRunning = false;
    console.log('Security audit scheduler stopped');
  }

  /**
   * Run a scheduled security audit
   */
  private async runScheduledAudit(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Security audits are disabled');
      return;
    }

    const auditId = `audit-${Date.now()}`;
    const timestamp = new Date();
    
    console.log(`Running scheduled security audit: ${auditId}`);

    try {
      const auditResult: ScheduledAuditResult = {
        id: auditId,
        timestamp,
        auditType: 'comprehensive',
        status: 'in_progress',
        findings: { critical: 0, high: 0, medium: 0, low: 0 },
        recommendations: [],
        nextScheduledRun: new Date(Date.now() + this.config.intervalMinutes * 60 * 1000)
      };

      // Run each audit type
      for (const auditType of this.config.auditTypes) {
        await this.runSpecificAudit(auditType, auditResult);
      }

      // Analyze overall security posture
      this.analyzeSecurityPosture(auditResult);

      // Update status
      auditResult.status = 'completed';

      // Store audit result
      this.auditHistory.push(auditResult);

      // Keep only last 100 audit results
      if (this.auditHistory.length > 100) {
        this.auditHistory = this.auditHistory.slice(-100);
      }

      // Check if immediate action is required
      this.checkForImmediateThreats(auditResult);

      console.log(`Security audit ${auditId} completed with ${auditResult.findings.critical} critical findings`);

    } catch (error) {
      console.error(`Security audit ${auditId} failed:`, error);
      
      // Log failed audit
      this.auditHistory.push({
        id: auditId,
        timestamp,
        auditType: 'comprehensive',
        status: 'failed',
        findings: { critical: 0, high: 0, medium: 0, low: 0 },
        recommendations: ['Audit system failure - manual review required'],
        nextScheduledRun: new Date(Date.now() + this.config.intervalMinutes * 60 * 1000)
      });
    }
  }

  /**
   * Run a specific type of security audit
   */
  private async runSpecificAudit(auditType: string, result: ScheduledAuditResult): Promise<void> {
    const securityMetrics = securityService.getSecurityMetrics();
    
    switch (auditType) {
      case 'authentication_check':
        await this.auditAuthentication(securityMetrics, result);
        break;
      
      case 'rate_limit_review':
        await this.auditRateLimiting(securityMetrics, result);
        break;
      
      case 'security_alerts_analysis':
        await this.auditSecurityAlerts(securityMetrics, result);
        break;
      
      case 'audit_log_review':
        await this.auditLogReview(securityMetrics, result);
        break;
      
      case 'api_key_validation':
        await this.auditAPIKeys(securityMetrics, result);
        break;
      
      default:
        console.warn(`Unknown audit type: ${auditType}`);
    }
  }

  /**
   * Audit authentication security
   */
  private async auditAuthentication(metrics: any, result: ScheduledAuditResult): Promise<void> {
    // Check for authentication-related issues
    if (metrics.riskLevelDistribution.critical > 0) {
      result.findings.critical += metrics.riskLevelDistribution.critical;
      result.recommendations.push('Critical authentication issues detected - immediate review required');
    }

    if (metrics.riskLevelDistribution.high > this.config.alertThresholds.highRiskLogs) {
      result.findings.high += 1;
      result.recommendations.push('High number of high-risk authentication events detected');
    }
  }

  /**
   * Audit rate limiting configuration
   */
  private async auditRateLimiting(metrics: any, result: ScheduledAuditResult): Promise<void> {
    if (metrics.activeAPIKeys === 0) {
      result.findings.medium += 1;
      result.recommendations.push('No active API keys detected - verify rate limiting configuration');
    }

    // Additional rate limiting checks would go here
    result.findings.low += 1; // Placeholder for rate limiting review
  }

  /**
   * Audit security alerts
   */
  private async auditSecurityAlerts(metrics: any, result: ScheduledAuditResult): Promise<void> {
    if (metrics.alertSeverityDistribution.critical > this.config.alertThresholds.criticalAlerts) {
      result.findings.critical += 1;
      result.recommendations.push(`${metrics.alertSeverityDistribution.critical} critical security alerts require immediate attention`);
    }

    if (metrics.recentSecurityAlerts > 10) {
      result.findings.high += 1;
      result.recommendations.push('High volume of security alerts detected in last 24 hours');
    }
  }

  /**
   * Audit log review
   */
  private async auditLogReview(metrics: any, result: ScheduledAuditResult): Promise<void> {
    const auditLogs = securityService.getAuditLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: 'high'
    });

    if (auditLogs.length > this.config.alertThresholds.highRiskLogs) {
      result.findings.high += 1;
      result.recommendations.push(`${auditLogs.length} high-risk audit log entries in last 24 hours`);
    }

    // Check for failed operations
    const failedLogs = securityService.getAuditLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }).filter(log => !log.success);

    if (failedLogs.length > 5) {
      result.findings.medium += 1;
      result.recommendations.push(`${failedLogs.length} failed operations detected`);
    }
  }

  /**
   * Audit API keys
   */
  private async auditAPIKeys(metrics: any, result: ScheduledAuditResult): Promise<void> {
    // This would typically check API key expiration, usage patterns, etc.
    if (metrics.activeAPIKeys > 0) {
      result.findings.low += 1; // Placeholder for API key validation
    }
  }

  /**
   * Analyze overall security posture
   */
  private analyzeSecurityPosture(result: ScheduledAuditResult): void {
    const totalFindings = result.findings.critical + result.findings.high + result.findings.medium + result.findings.low;
    
    if (totalFindings === 0) {
      result.recommendations.push('Security posture is good - no issues detected');
    } else if (result.findings.critical > 0) {
      result.recommendations.unshift('URGENT: Critical security issues require immediate attention');
    } else if (result.findings.high > 3) {
      result.recommendations.unshift('Multiple high-priority security issues detected');
    }
  }

  /**
   * Check for immediate security threats
   */
  private checkForImmediateThreats(result: ScheduledAuditResult): void {
    if (result.findings.critical > 0) {
      // In a real implementation, this would trigger immediate notifications
      console.error('CRITICAL SECURITY THREAT DETECTED:', result);
      
      securityService.logSecurityAlert({
        type: 'suspicious_activity',
        severity: 'critical',
        message: `Automated audit detected ${result.findings.critical} critical security issues`,
        details: { auditId: result.id, findings: result.findings }
      });
    }
  }

  /**
   * Get audit configuration
   */
  public getConfig(): SecurityAuditConfig {
    return { ...this.config };
  }

  /**
   * Update audit configuration
   */
  public updateConfig(newConfig: Partial<SecurityAuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart scheduler if interval changed
    if (newConfig.intervalMinutes && this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get audit history
   */
  public getAuditHistory(limit = 10): ScheduledAuditResult[] {
    return this.auditHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get current audit status
   */
  public getStatus(): {
    isRunning: boolean;
    nextRun: Date | null;
    lastAudit: ScheduledAuditResult | null;
    totalAudits: number;
  } {
    const lastAudit = this.auditHistory.length > 0 ? 
      this.auditHistory[this.auditHistory.length - 1] : null;
    
    return {
      isRunning: this.isRunning,
      nextRun: lastAudit ? lastAudit.nextScheduledRun : null,
      lastAudit,
      totalAudits: this.auditHistory.length
    };
  }

  /**
   * Run manual audit
   */
  public async runManualAudit(): Promise<ScheduledAuditResult> {
    console.log('Running manual security audit...');
    await this.runScheduledAudit();
    return this.auditHistory[this.auditHistory.length - 1];
  }
}

export const securityAuditScheduler = new SecurityAuditScheduler();
export default securityAuditScheduler;