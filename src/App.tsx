import React, { useState, useEffect } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Grid,
  Paper,
  Box,
  Alert,
  Button,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar
} from '@mui/material';
import NavigationDrawer from './components/NavigationDrawer';
import { 
  AutoFixHigh, 
  Security,
  Download,
  Description,
  Group,
  Analytics,
  Settings,
  Api,
  Login,
  Logout
} from '@mui/icons-material';
// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DocumentProvider } from './contexts/DocumentContext';
// Components
import TextEditor from './components/TextEditor';
import CustomizationPanel from './components/CustomizationPanel';

import DetectionResults from './components/DetectionResults';
import ExportDialog from './components/ExportDialog';
import AcademicIntegrityDialog from './components/AcademicIntegrityDialog';
import ResponsibleUseWarning from './components/ResponsibleUseWarning';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { UserProfile } from './components/UserProfile';
import { DocumentManager } from './components/DocumentManager';
import { CollaborationPanel } from './components/CollaborationPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import ApiDocumentation from './components/ApiDocumentation';
// Types
import { HumanizationSettings } from './types/humanization';
// Services
import { humanizationEngine } from './services/humanizationEngine';
import { DetectionResult } from './services/detectionService';
import { advancedDetectionService } from './services/advancedDetectionService';
import { ExportData } from './services/exportService';
import { integrityService } from './services/integrityService';
import { websocketService } from './services/websocketService';
import { securityService } from './services/securityService';
import { pwaService } from './services/pwaService';
import { analyticsService } from './services/analyticsService';
// Removed unused service imports
import './App.css';
import './AppStyles.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});



// Main App Component with Navigation
function MainApp() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('humanizer');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  // State for PWA features
  const [error, setError] = useState<string | null>(null);
  // Removed unused state variables
  // const [installPrompt, setInstallPrompt] = useState<any>(null);
  // const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  
  // Humanizer state
  const [originalText, setOriginalText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [settings, setSettings] = useState<HumanizationSettings>({
    tone: 'academic',
    formalityLevel: 7,
    subjectArea: 'general',
    preserveStructure: true,
    addTransitions: true,
    varyingSentenceLength: true,
    creativityLevel: 5,
    vocabularyComplexity: 6,
    sentenceComplexity: 5,
    personalityStrength: 4,
    targetAudience: 'general',
    writingStyle: 'expository',
    aiDetectionAvoidance: 8,
    linguisticFingerprinting: 7,
    audience: 'general',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [integrityDialogOpen, setIntegrityDialogOpen] = useState(false);
  const [showResponsibleUseWarning, setShowResponsibleUseWarning] = useState(true);

  const menuItems = [
    { id: 'humanizer', label: 'AI Humanizer', icon: <AutoFixHigh /> },
    { id: 'documents', label: 'Documents', icon: <Description /> },
    { id: 'collaboration', label: 'Collaboration', icon: <Group /> },
    { id: 'analytics', label: 'Analytics', icon: <Analytics /> },
    { id: 'api', label: 'API Documentation', icon: <Api /> },
  ];

  // Check integrity preferences on component mount
  useEffect(() => {
    const shouldShowDialog = integrityService.shouldShowIntegrityDialog();
    const shouldShowWarning = integrityService.shouldShowWarning();
    
    setIntegrityDialogOpen(shouldShowDialog);
    setShowResponsibleUseWarning(shouldShowWarning);
  }, []);

  // Initialize advanced services
  useEffect(() => {
    
    const initializeServices = async () => {
      try {
        // Initialize PWA service
        await pwaService.initialize();
        
        // Initialize WebSocket for real-time features
        if (user) {
          websocketService.connect(user.id);
        }
        
        // Initialize analytics
        analyticsService.initialize();
        
        // Track app launch
        analyticsService.trackEvent('page_view', {
          userId: user?.id,
          timestamp: Date.now()
        });
        
        // Initialize security service
        securityService.initialize();
        
        // Check for app updates
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
              // Show update notification
              console.log('New version available');
            }
          });
        }
        
        console.log('Services initialized successfully');
        
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setError('Service initialization failed. Some features may be limited.');
      }
    };
    
    initializeServices();



    // PWA install prompt - simplified since we removed the installPrompt state
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      // Notification can be shown directly without storing the event
      console.log('App can be installed');
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      // Removed orphaned listener cleanup (handleOnline/handleOffline never defined)
      // Removed orphaned listener cleanup (handleOffline never defined)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (user) {
        websocketService.disconnect();
      }
    };
  }, [user]);

  const handleTextUpload = (text: string) => {
    setOriginalText(text);
    if (text.trim()) {
      handleHumanize(text);
    }
  };

  const handleHumanize = async (text: string) => {
    // Check if user has accepted guidelines for significant usage
    if (text.length > 500 && integrityService.shouldShowIntegrityDialog()) {
      setIntegrityDialogOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      // Use advanced AI humanization engine
      const result = await humanizationEngine.humanizeText(text, settings);
      setHumanizedText(result.text);
      
      // Log usage for transparency
      integrityService.logUsage('humanize', text.length, true);
    } catch (error) {
      console.error('Error humanizing text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeText = async () => {
    const textToAnalyze = humanizedText || originalText;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    try {
      // Use advanced detection service for comprehensive analysis
      const advancedResult = await advancedDetectionService.detectWithMultipleProviders(textToAnalyze);
      
      // Convert to compatible format for existing UI
      const result: DetectionResult = {
        // Required properties for new interface
        isAIGenerated: advancedResult.averageScore > 50,
        confidence: advancedResult.confidence,
        riskLevel: advancedResult.averageScore < 40 ? 'low' : 
                  advancedResult.averageScore < 65 ? 'medium' : 'high',
        detectedPatterns: advancedResult.summary.recommendations,
        suggestions: advancedResult.summary.recommendations,
        // Legacy properties for backward compatibility
        aiDetectionScore: advancedResult.averageScore,
        plagiarismRisk: Math.min(advancedResult.averageScore * 0.8, 100), // Estimate plagiarism risk
        readabilityScore: Math.max(100 - advancedResult.averageScore * 0.6, 0), // Inverse relationship
        uniquenessScore: Math.max(100 - advancedResult.averageScore * 0.7, 0), // Inverse relationship
        detectionDetails: {
          aiIndicators: advancedResult.summary.recommendations,
          plagiarismIndicators: [],
          qualityMetrics: {
            lexicalDiversity: Math.max(100 - advancedResult.averageScore * 0.5, 0),
            sentenceVariation: Math.max(100 - advancedResult.averageScore * 0.4, 0),
            vocabularyComplexity: Math.max(100 - advancedResult.averageScore * 0.3, 0),
            coherenceScore: Math.max(100 - advancedResult.averageScore * 0.2, 0)
          }
        },
        recommendations: advancedResult.summary.recommendations
      };
      
      setDetectionResult(result);
      
      // Log usage for transparency
      integrityService.logUsage('analyze', textToAnalyze.length, true);
    } catch (error) {
      console.error('Analysis failed:', error);
      setDetectionResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenExport = () => {
    setExportDialogOpen(true);
  };

  const getExportData = (): ExportData => {
    return {
      originalText,
      humanizedText,
      settings: settings,
      detectionResult: detectionResult || undefined,
      timestamp: new Date().toISOString()
    };
  };

  const handleAcceptIntegrityGuidelines = () => {
    integrityService.acceptGuidelines();
    setIntegrityDialogOpen(false);
    
    // If there was pending text to humanize, process it now
    if (originalText.trim()) {
      handleHumanize(originalText);
    }
  };

  const handleOpenIntegrityGuidelines = () => {
    setIntegrityDialogOpen(true);
  };

  const handleDismissWarning = () => {
    integrityService.dismissWarning();
    setShowResponsibleUseWarning(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    setCurrentView('humanizer');
  };

  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document);
    setCurrentView('collaboration');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'documents':
        return <DocumentManager onDocumentSelect={handleDocumentSelect} />;
      case 'collaboration':
        return (
          <CollaborationPanel 
            documentId={selectedDocument?.id || 'demo-doc'} 
            isOwner={selectedDocument?.author === user?.email || true}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'api':
        return <ApiDocumentation />;
      case 'profile':
        return <UserProfile />;
      default:
        return renderHumanizerContent();
    }
  };

  const renderHumanizerContent = () => (
    <>
      {showResponsibleUseWarning && (
        <ResponsibleUseWarning
          variant="compact"
          severity="warning"
          onOpenGuidelines={handleOpenIntegrityGuidelines}
          showDismiss={true}
          onDismiss={handleDismissWarning}
        />
      )}

      <Grid container spacing={3}>
        {/* Left Sidebar - Controls */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
              Upload Document
            </Typography>
            <input
              type="file"
              accept=".txt,.docx,.pdf"
              style={{ display: 'none' }}
              id="document-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const text = evt.target?.result as string;
                    handleTextUpload(text);
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <label htmlFor="document-upload">
              <Button variant="contained" component="span" startIcon={<Security />}>
                Upload Document
              </Button>
            </label>
          </Paper>

          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <CustomizationPanel
              settings={settings}
              onSettingsChange={setSettings}
              onHumanize={() => originalText && handleHumanize(originalText)}
              onAnalyze={handleAnalyzeText}
              isProcessing={isProcessing}
              isAnalyzing={isAnalyzing}
            />
          </Paper>

          <Paper elevation={2} className="document-editor-paper">
            <Box className="document-editor-header">
              <Typography variant="h5" component="h2">
                Document Editor
              </Typography>
              {humanizedText && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleOpenExport}
                  className="export-button"
                >
                  Export Document
                </Button>
              )}
            </Box>
            <TextEditor
              originalText={originalText}
              humanizedText={humanizedText}
              onOriginalTextChange={setOriginalText}
              onHumanizedTextChange={setHumanizedText}
              isProcessing={isProcessing}
            />
          </Paper>

          {/* Detection Results */}
          {detectionResult && (
            <Box className="detection-results-container">
              <DetectionResults 
                result={detectionResult} 
                isLoading={isAnalyzing}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {error && (
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      )}
      <Box className="main-layout-container">
        {/* Navigation Drawer */}
        <NavigationDrawer
          menuItems={menuItems}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Main Content */}
        <Box component="main" className="main-content-area">
          <AppBar position="static" elevation={1} className="app-bar">
            <Toolbar>
              <Typography variant="h6" component="div" className="app-bar-title">
                {menuItems.find(item => item.id === currentView)?.label || 'AI Document Humanizer'}
              </Typography>
              
              {user ? (
                <Box className="user-info-container">
                  <Typography variant="body2">
                    Welcome, {user.name}
                  </Typography>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenuClick}
                    color="inherit"
                  >
                    <Avatar className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => { setCurrentView('profile'); handleMenuClose(); }}>
                      <Settings sx={{ mr: 1 }} />
                      Profile & Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button
                  color="inherit"
                  startIcon={<Login />}
                  onClick={() => setCurrentView('login')}
                >
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flexGrow: 1 }}>
            {renderContent()}
          </Container>
        </Box>
      </Box>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        exportData={getExportData()}
      />

      {/* Academic Integrity Dialog */}
      <AcademicIntegrityDialog
        open={integrityDialogOpen}
        onClose={() => setIntegrityDialogOpen(false)}
        onAccept={handleAcceptIntegrityGuidelines}
      />
    </MuiThemeProvider>
  );
}

// Authentication Wrapper Component
function AuthWrapper() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (!user) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Box className="auth-wrapper-container">
          <Container maxWidth="sm">
            <Paper elevation={3} className="auth-paper">
              <Box className="auth-header">
                <AutoFixHigh className="auth-icon" />
                <Typography variant="h4" component="h1" gutterBottom>
                  AI Document Humanizer
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Transform AI-generated content into natural, human-like text
                </Typography>
              </Box>
              
              {authView === 'login' ? (
                <LoginForm onSwitchToRegister={() => setAuthView('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
              )}
            </Paper>
          </Container>
        </Box>
      </MuiThemeProvider>
    );
  }

  return <MainApp />;
}

// Root App Component with Providers
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DocumentProvider>
          <AuthWrapper />
        </DocumentProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
