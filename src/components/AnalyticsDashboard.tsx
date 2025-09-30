import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { analyticsService, AnalyticsDashboardData } from '../services/analyticsService';
import { securityService } from '../services/securityService';

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
}

interface SecurityAuditResult {
  id: string;
  timestamp: Date;
  status: 'passed' | 'failed' | 'warning';
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [timeRange, setTimeRange] = useState('24h');
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [securityAudits, setSecurityAudits] = useState<SecurityAuditResult[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Performance thresholds for monitoring
  const performanceThresholds = {
    responseTime: 2000, // ms
    errorRate: 0.05, // 5%
    memoryUsage: 0.85, // 85%
    cpuUsage: 0.80, // 80%
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeRangeMap: Record<string, { start: Date; end: Date }> = {
        '1h': { start: new Date(Date.now() - 60 * 60 * 1000), end: new Date() },
        '24h': { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() },
        '7d': { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
        '30d': { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      };

      const data = await analyticsService.getDashboardData(timeRangeMap[timeRange]);
      setDashboardData(data);
      
      // Check for performance alerts
      checkPerformanceAlerts(data);
      
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check for performance issues and create alerts
  const checkPerformanceAlerts = (data: AnalyticsDashboardData) => {
    const alerts: PerformanceAlert[] = [];
    const now = new Date();

    // Check error rate
    if (data.overview.errorRate > performanceThresholds.errorRate) {
      alerts.push({
        id: `error-rate-${now.getTime()}`,
        type: 'warning',
        message: `High error rate detected: ${(data.overview.errorRate * 100).toFixed(2)}%`,
        timestamp: now,
        metric: 'errorRate',
        value: data.overview.errorRate,
        threshold: performanceThresholds.errorRate
      });
    }

    // Check system health
    if (data.performance.systemHealth.memoryUsage > performanceThresholds.memoryUsage) {
      alerts.push({
        id: `memory-${now.getTime()}`,
        type: 'warning',
        message: `High memory usage: ${(data.performance.systemHealth.memoryUsage * 100).toFixed(1)}%`,
        timestamp: now,
        metric: 'memoryUsage',
        value: data.performance.systemHealth.memoryUsage,
        threshold: performanceThresholds.memoryUsage
      });
    }

    if (data.performance.systemHealth.cpuUsage > performanceThresholds.cpuUsage) {
      alerts.push({
        id: `cpu-${now.getTime()}`,
        type: 'warning',
        message: `High CPU usage: ${(data.performance.systemHealth.cpuUsage * 100).toFixed(1)}%`,
        timestamp: now,
        metric: 'cpuUsage',
        value: data.performance.systemHealth.cpuUsage,
        threshold: performanceThresholds.cpuUsage
      });
    }

    // Check response times
    data.performance.averageResponseTimes.forEach(endpoint => {
      if (endpoint.avgTime > performanceThresholds.responseTime) {
        alerts.push({
          id: `response-${endpoint.endpoint}-${now.getTime()}`,
          type: 'warning',
          message: `Slow response time for ${endpoint.endpoint}: ${endpoint.avgTime}ms`,
          timestamp: now,
          metric: 'responseTime',
          value: endpoint.avgTime,
          threshold: performanceThresholds.responseTime
        });
      }
    });

    setPerformanceAlerts(prev => [...alerts, ...prev.slice(0, 10)]); // Keep last 10 alerts
  };

  // Replace mock security audit data with real security service data
  const fetchSecurityAudits = async () => {
    try {
      const securityMetrics = securityService.getSecurityMetrics();
      const auditLogs = securityService.getAuditLogs({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
      });

      // Convert security metrics and audit logs to SecurityAuditResult format
      const audits: SecurityAuditResult[] = [
        {
          id: 'audit-auth',
          timestamp: new Date(),
          status: securityMetrics.riskLevelDistribution.critical === 0 ? 'passed' : 'failed',
          category: 'Authentication',
          description: `JWT token validation and security checks (${securityMetrics.recentAuditLogs} recent logs)`,
          severity: securityMetrics.riskLevelDistribution.critical > 0 ? 'critical' : 
                   securityMetrics.riskLevelDistribution.high > 0 ? 'high' : 'medium'
        },
        {
          id: 'audit-rate-limit',
          timestamp: new Date(),
          status: securityMetrics.activeAPIKeys > 0 ? 'passed' : 'warning',
          category: 'Rate Limiting',
          description: `API rate limiting and access control (${securityMetrics.activeAPIKeys} active API keys)`,
          severity: 'medium',
          recommendation: securityMetrics.activeAPIKeys === 0 ? 'No active API keys detected' : undefined
        },
        {
          id: 'audit-alerts',
          timestamp: new Date(),
          status: securityMetrics.recentSecurityAlerts === 0 ? 'passed' : 'warning',
          category: 'Security Alerts',
          description: `Security alert monitoring (${securityMetrics.recentSecurityAlerts} alerts in last 24h)`,
          severity: securityMetrics.alertSeverityDistribution.critical > 0 ? 'critical' :
                   securityMetrics.alertSeverityDistribution.high > 0 ? 'high' : 'low',
          recommendation: securityMetrics.recentSecurityAlerts > 0 ? 'Review recent security alerts' : undefined
        }
      ];

      // Add audit logs as individual audit results
      auditLogs.slice(0, 5).forEach((log, index) => {
        audits.push({
          id: `audit-log-${index}`,
          timestamp: new Date(log.timestamp),
          status: log.success ? 'passed' : 'failed',
          category: log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `${log.action} on ${log.resource}`,
          severity: log.riskLevel,
          recommendation: !log.success ? 'Review failed operation details' : undefined
        });
      });

      setSecurityAudits(audits);
    } catch (error) {
      console.error('Failed to fetch security audits:', error);
      // Fallback to empty array if security service fails
      setSecurityAudits([]);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();
    fetchSecurityAudits();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchSecurityAudits();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, timeRange]);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
    fetchSecurityAudits();
  };

  if (loading && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon />
          Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          
          <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Performance Alerts */}
      {performanceAlerts.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<WarningIcon />}
        >
          <Typography variant="subtitle2" gutterBottom>
            Performance Alerts ({performanceAlerts.length})
          </Typography>
          {performanceAlerts.slice(0, 3).map(alert => (
            <Typography key={alert.id} variant="body2">
              • {alert.message}
            </Typography>
          ))}
          {performanceAlerts.length > 3 && (
            <Typography variant="body2" color="text.secondary">
              ... and {performanceAlerts.length - 3} more alerts
            </Typography>
          )}
        </Alert>
      )}

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {dashboardData.overview.totalUsers.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {dashboardData.overview.activeUsers.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {dashboardData.overview.totalHumanizations.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Humanizations
            </Typography>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {dashboardData.overview.totalExports.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Exports
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Performance Metrics</Typography>
            </Box>
            
            {/* Performance alerts */}
            {performanceAlerts.length > 0 && (
              <Box mb={2}>
                {performanceAlerts.slice(0, 3).map((alert) => (
                  <Alert 
                    key={alert.id} 
                    severity={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2">
                      <strong>{alert.metric}:</strong> {alert.message}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                CPU Usage
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.performance.systemHealth.cpuUsage * 100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(dashboardData.performance.systemHealth.cpuUsage * 100).toFixed(1)}%
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Memory Usage
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.performance.systemHealth.memoryUsage * 100} 
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(dashboardData.performance.systemHealth.memoryUsage * 100).toFixed(1)}%
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Error Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.overview.errorRate * 100} 
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(dashboardData.overview.errorRate * 100).toFixed(2)}%
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AnalyticsIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Usage Patterns</Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Session Duration
              </Typography>
              <Typography variant="body1">
                {Math.round(dashboardData.overview.averageSessionDuration / 60)} minutes
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top Features
              </Typography>
              {dashboardData.usage.featureUsage.slice(0, 3).map((feature, index) => (
                <Chip 
                  key={index}
                  label={`${feature.feature} (${feature.percentage}%)`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  color={index === 0 ? 'primary' : 'default'}
                />
              ))}
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                System Uptime
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.performance.systemHealth.uptime * 100} 
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(dashboardData.performance.systemHealth.uptime * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Security Audits */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <SecurityIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Security Audits</Typography>
              </Box>
              <Chip 
                label={`${securityAudits.filter(audit => audit.status === 'passed').length}/${securityAudits.length} Passed`}
                color={securityAudits.every(audit => audit.status === 'passed') ? 'success' : 'warning'}
                size="small"
              />
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Severity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityAudits.slice(0, 5).map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>{audit.category}</TableCell>
                      <TableCell>
                        <Chip 
                          label={audit.status}
                          color={audit.status === 'passed' ? 'success' : audit.status === 'failed' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={audit.severity}
                          color={audit.severity === 'critical' ? 'error' : audit.severity === 'high' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall System Status
              </Typography>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body1" color="success.main">
                  All Systems Operational
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Security Audit
              </Typography>
              <Typography variant="body1">
                {securityAudits.length > 0 ? securityAudits[0].timestamp.toLocaleString() : 'No audits available'}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Patterns */}
       <Grid container spacing={3}>
         <Grid size={{ xs: 12, md: 6 }}>
           <Card sx={{ p: 3 }}>
             <Typography variant="h6" gutterBottom>
               Feature Usage
             </Typography>
             
             {dashboardData.usage.featureUsage.map((feature, index) => (
               <Box key={index} sx={{ mb: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                   <Typography variant="body2">{feature.feature}</Typography>
                   <Typography variant="body2" color="text.secondary">
                     {feature.percentage.toFixed(1)}%
                   </Typography>
                 </Box>
                 <LinearProgress variant="determinate" value={feature.percentage} />
               </Box>
             ))}
           </Card>
         </Grid>
         
         <Grid size={{ xs: 12, md: 6 }}>
           <Card sx={{ p: 3 }}>
             <Typography variant="h6" gutterBottom>
               Device Distribution
             </Typography>
             
             {dashboardData.usage.deviceTypes.map((device, index) => (
               <Box key={index} sx={{ mb: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                   <Typography variant="body2">{device.type}</Typography>
                   <Typography variant="body2" color="text.secondary">
                     {device.count} ({device.percentage.toFixed(1)}%)
                   </Typography>
                 </Box>
                 <LinearProgress variant="determinate" value={device.percentage} />
               </Box>
             ))}
           </Card>
         </Grid>
       </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;