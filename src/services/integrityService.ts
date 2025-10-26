export interface IntegrityPreferences {
  hasAcceptedGuidelines: boolean;
  showWarnings: boolean;
  lastAcceptedDate: string | null;
  warningDismissedUntil: string | null;
  institutionType?: 'university' | 'high_school' | 'professional' | 'other';
  customPolicies?: string[];
}

export interface UsageLog {
  timestamp: string;
  action: 'humanize' | 'analyze' | 'export';
  textLength: number;
  acknowledged: boolean;
}

class IntegrityService {
  private readonly STORAGE_KEY = 'ai_humanizer_integrity_prefs';
  private readonly USAGE_LOG_KEY = 'ai_humanizer_usage_log';
  private readonly WARNING_DURATION_DAYS = 7; // Show warnings again after 7 days
  private readonly SESSION_ACK_KEY = 'ai_humanizer_session_acknowledged';

  /**
   * Get user's integrity preferences from localStorage
   */
  getPreferences(): IntegrityPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load integrity preferences:', error);
    }

    // Default preferences for new users
    return {
      hasAcceptedGuidelines: false,
      showWarnings: true,
      lastAcceptedDate: null,
      warningDismissedUntil: null
    };
  }

  /**
   * Save user's integrity preferences to localStorage
   */
  savePreferences(preferences: IntegrityPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save integrity preferences:', error);
    }
  }

  /**
   * Mark that user has accepted the academic integrity guidelines
   */
  acceptGuidelines(): void {
    const preferences = this.getPreferences();
    preferences.hasAcceptedGuidelines = true;
    preferences.lastAcceptedDate = new Date().toISOString();
    this.savePreferences(preferences);

    // Also mark current session as acknowledged
    try {
      sessionStorage.setItem(this.SESSION_ACK_KEY, '1');
    } catch (error) {
      console.warn('Failed to mark session acknowledgment:', error);
    }
  }

  /**
   * Check if user needs to see the integrity dialog
   * Modified to disable the modal entirely.
   */
  shouldShowIntegrityDialog(): boolean {
    return false;
  }

  /**
   * Check if warning banner should be shown
   */
  shouldShowWarning(): boolean {
    const preferences = this.getPreferences();
    
    if (!preferences.showWarnings) {
      return false;
    }

    // Check if warning was dismissed and still within dismissal period
    if (preferences.warningDismissedUntil) {
      const dismissedUntil = new Date(preferences.warningDismissedUntil);
      const now = new Date();
      
      if (now < dismissedUntil) {
        return false;
      }
    }

    return true;
  }

  /**
   * Dismiss warning banner for a specified duration
   */
  dismissWarning(days: number = this.WARNING_DURATION_DAYS): void {
    const preferences = this.getPreferences();
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + days);
    
    preferences.warningDismissedUntil = dismissUntil.toISOString();
    this.savePreferences(preferences);
  }

  /**
   * Update user's institution type and custom policies
   */
  updateInstitutionInfo(
    institutionType: IntegrityPreferences['institutionType'],
    customPolicies?: string[]
  ): void {
    const preferences = this.getPreferences();
    preferences.institutionType = institutionType;
    preferences.customPolicies = customPolicies;
    this.savePreferences(preferences);
  }

  /**
   * Log usage for transparency and accountability
   */
  logUsage(action: UsageLog['action'], textLength: number, acknowledged: boolean = true): void {
    try {
      const log: UsageLog = {
        timestamp: new Date().toISOString(),
        action,
        textLength,
        acknowledged
      };

      const existingLogs = this.getUsageLogs();
      existingLogs.push(log);

      // Keep only last 100 entries to prevent storage bloat
      const recentLogs = existingLogs.slice(-100);
      
      localStorage.setItem(this.USAGE_LOG_KEY, JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to log usage:', error);
    }
  }

  /**
   * Get usage logs for transparency
   */
  getUsageLogs(): UsageLog[] {
    try {
      const stored = localStorage.getItem(this.USAGE_LOG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load usage logs:', error);
    }
    return [];
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalSessions: number;
    humanizeCount: number;
    analyzeCount: number;
    exportCount: number;
    averageTextLength: number;
    acknowledgedSessions: number;
  } {
    const logs = this.getUsageLogs();
    
    const stats = {
      totalSessions: logs.length,
      humanizeCount: logs.filter(log => log.action === 'humanize').length,
      analyzeCount: logs.filter(log => log.action === 'analyze').length,
      exportCount: logs.filter(log => log.action === 'export').length,
      averageTextLength: 0,
      acknowledgedSessions: logs.filter(log => log.acknowledged).length
    };

    if (logs.length > 0) {
      const totalLength = logs.reduce((sum, log) => sum + log.textLength, 0);
      stats.averageTextLength = Math.round(totalLength / logs.length);
    }

    return stats;
  }

  /**
   * Clear all stored data (for privacy)
   */
  clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.USAGE_LOG_KEY);
      sessionStorage.removeItem(this.SESSION_ACK_KEY);
    } catch (error) {
      console.warn('Failed to clear integrity data:', error);
    }
  }

  /**
   * Clear only the session acknowledgment (use on logout)
   */
  clearSessionAcknowledgement(): void {
    try {
      sessionStorage.removeItem(this.SESSION_ACK_KEY);
    } catch (error) {
      console.warn('Failed to clear session acknowledgment:', error);
    }
  }

  /**
   * Export user data for transparency
   */
  exportUserData(): {
    preferences: IntegrityPreferences;
    usageLogs: UsageLog[];
    stats: {
      totalSessions: number;
      humanizeCount: number;
      analyzeCount: number;
      exportCount: number;
      averageTextLength: number;
      acknowledgedSessions: number;
    };
  } {
    return {
      preferences: this.getPreferences(),
      usageLogs: this.getUsageLogs(),
      stats: this.getUsageStats()
    };
  }

  /**
   * Get recommendations based on usage patterns
   */
  getRecommendations(): string[] {
    const stats = this.getUsageStats();
    const preferences = this.getPreferences();
    const recommendations: string[] = [];

    // Check for high usage without acknowledgment
    if (stats.totalSessions > 10 && stats.acknowledgedSessions / stats.totalSessions < 0.8) {
      recommendations.push(
        'Consider reviewing academic integrity guidelines more frequently to ensure responsible use.'
      );
    }

    // Check for large text processing
    if (stats.averageTextLength > 2000) {
      recommendations.push(
        'For large documents, consider processing in smaller sections and maintaining clear records of changes.'
      );
    }

    // Institution-specific recommendations
    if (preferences.institutionType === 'university') {
      recommendations.push(
        'University students should always check with professors before using AI assistance tools.'
      );
    } else if (preferences.institutionType === 'high_school') {
      recommendations.push(
        'High school students should discuss AI tool usage with teachers and parents.'
      );
    }

    // Frequency-based recommendations
    if (stats.humanizeCount > stats.analyzeCount * 3) {
      recommendations.push(
        'Consider using the analysis feature more often to understand and learn from the changes being made.'
      );
    }

    return recommendations;
  }
}

export const integrityService = new IntegrityService();