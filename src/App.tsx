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
  Avatar,
  Fade
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  Logout,
  Home
} from '@mui/icons-material';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DocumentProvider } from './contexts/DocumentContext';

// Components
import TextEditor from './components/TextEditor';
import DocumentUploader from './components/DocumentUploader';
import TextStatistics from './components/TextStatistics';
import CustomizationPanel from './components/CustomizationPanel';
import DetectionResults from './components/DetectionResults';
import ExportDialog from './components/ExportDialog';
import AcademicIntegrityDialog from './components/AcademicIntegrityDialog';
import ResponsibleUseWarning from './components/ResponsibleUseWarning';

import { DocumentManager } from './components/DocumentManager';
import { CollaborationPanel } from './components/CollaborationPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import ApiDocumentation from './components/ApiDocumentation';

// New Enhanced Components
import { ModernLoginPage } from './components/auth/ModernLoginPage';
import { ModernRegisterPage } from './components/auth/ModernRegisterPage';
import { EnhancedHomepage } from './components/EnhancedHomepage';

// Types
import { HumanizationSettings } from './types/humanization';

// Services
import { humanizationEngine } from './services/humanizationEngine';
import { DetectionResult, detectionService } from './services/detectionService';
import { integrityService } from './services/integrityService';
import { securityService } from './services/securityService';
import { pwaService } from './services/pwaService';
import { analyticsService } from './services/analyticsService';
import { securityAuditScheduler } from './services/securityAuditScheduler';

// Styles
import './App.css';
import './AppStyles.css';
import './styles/AdvancedStyles.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#f093fb',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Enhanced App Bar Component
function EnhancedAppBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // Don't show app bar on login page
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <AppBar 
      position="sticky" 
      className="enhanced-app-bar"
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/app')}
          sx={{ mr: 2 }}
        >
          <AutoFixHigh />
        </IconButton>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          className="app-bar-title"
        >
          AI Humanizer
        </Typography>
        
        {user && (
          <>
            <IconButton
              color="inherit"
              onClick={() => navigate('/app')}
              sx={{ mr: 1 }}
            >
              <Home />
            </IconButton>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                }}
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Main App Component with Navigation
function MainApp() {
  const [currentView, setCurrentView] = useState<string>('humanizer');
  const [error, setError] = useState<string | null>(null);
  
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
        await Promise.all([
          securityService.initialize(),
          pwaService.initialize(),
          analyticsService.initialize()
        ]);

        // Initialize and start automated security audits
        securityAuditScheduler.start();

        console.log('Security audit scheduler started successfully');
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setError('Failed to initialize some services. Some features may not work properly.');
      }
    };

    initializeServices();

    // Cleanup function to stop the scheduler when component unmounts
    return () => {
      securityAuditScheduler.stop();
    };
  }, []);

  const handleHumanize = async () => {
    if (!originalText.trim()) {
      setError('Please enter some text to humanize.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await humanizationEngine.humanizeText(originalText, settings);
      setHumanizedText(result.text);
      
      // Track analytics
      analyticsService.trackEvent('humanize', {
        action: 'text_humanized',
        value: {
          originalLength: originalText.length,
          humanizedLength: result.text.length,
          settings: settings
        }
      });
    } catch (error) {
      console.error('Humanization failed:', error);
      setError('Failed to humanize text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!humanizedText.trim()) {
      setError('Please humanize some text first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await detectionService.analyzeText(humanizedText);
      setDetectionResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setOriginalText(content);
      };
      reader.readAsText(file);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'documents':
        return <DocumentManager onDocumentSelect={() => {}} />;
      case 'collaboration':
        return <CollaborationPanel documentId="default-doc" isOwner={true} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'api':
        return <ApiDocumentation />;
      default:
        return (
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Grid spacing={3}>
               {/* Text Input Section */}
               <Grid size={{ xs: 12, lg: 6 }}>
                <Paper className="enhanced-card" sx={{ p: 3, height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Original Text
                    </Typography>
                    <Box>
                      <input
                        accept=".txt,.doc,.docx"
                        style={{ display: 'none' }}
                        id="file-upload"
                        type="file"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Description />}
                          sx={{ mr: 1 }}
                        >
                          Upload
                        </Button>
                      </label>
                      <Button
                        variant="contained"
                        onClick={handleHumanize}
                        disabled={isProcessing || !originalText.trim()}
                        className="enhanced-button"
                        startIcon={<AutoFixHigh />}
                      >
                        {isProcessing ? 'Humanizing...' : 'Humanize'}
                      </Button>
                    </Box>
                  </Box>
                  {/* Uploader for DOCX/PDF/TXT and paste */}
                  <Box sx={{ mb: 2 }}>
                    <DocumentUploader
                      onTextExtracted={(text) => setOriginalText(text)}
                    />
                  </Box>

                  {/* Editor for original and humanized text */}
                  <TextEditor
                    originalText={originalText}
                    humanizedText={humanizedText}
                    onOriginalTextChange={setOriginalText}
                    onHumanizedTextChange={setHumanizedText}
                    isProcessing={isProcessing}
                  />

                  {/* Statistics panel */}
                  <Box sx={{ mt: 2 }}>
                    <TextStatistics
                      originalText={originalText}
                      humanizedText={humanizedText}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Humanized Text Section */}
               <Grid size={{ xs: 12, lg: 6 }}>
                <Paper className="enhanced-card" sx={{ p: 3, height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Humanized Text
                    </Typography>
                    <Box>
                      <Button
                        variant="outlined"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !humanizedText.trim()}
                        startIcon={<Security />}
                        sx={{ mr: 1 }}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setExportDialogOpen(true)}
                        disabled={!humanizedText.trim()}
                        startIcon={<Download />}
                        className="enhanced-button"
                      >
                        Export
                      </Button>
                    </Box>
                  </Box>
                  <TextEditor
                    originalText={originalText}
                    humanizedText={humanizedText}
                    onOriginalTextChange={setOriginalText}
                    onHumanizedTextChange={setHumanizedText}
                    isProcessing={isProcessing}
                  />
                </Paper>
              </Grid>

              {/* Customization Panel */}
               <Grid size={{ xs: 12, lg: 4 }}>
                 <CustomizationPanel
                   settings={settings}
                   onSettingsChange={setSettings}
                 />
               </Grid>

               {/* Detection Results */}
               <Grid size={{ xs: 12, lg: 8 }}>
                {detectionResult && (
                  <DetectionResults result={detectionResult} />
                )}
              </Grid>
            </Grid>

            {/* Dialogs */}
            <ExportDialog
              open={exportDialogOpen}
              onClose={() => setExportDialogOpen(false)}
              exportData={{
                originalText,
                humanizedText,
                detectionResult: detectionResult || undefined,
                settings,
                timestamp: new Date().toISOString()
              }}
            />

            <AcademicIntegrityDialog
              open={integrityDialogOpen}
              onClose={() => setIntegrityDialogOpen(false)}
              onAccept={() => setIntegrityDialogOpen(false)}
            />

            {showResponsibleUseWarning && (
              <ResponsibleUseWarning
                variant="compact"
                severity="warning"
                onOpenGuidelines={() => console.log('Opening guidelines')}
                showDismiss={true}
                onDismiss={() => setShowResponsibleUseWarning(false)}
              />
            )}
          </Container>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <NavigationDrawer
        menuItems={menuItems}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {renderCurrentView()}
      </Box>
    </Box>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        className="loading-shimmer"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// Main App Router
function AppRouter() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/app');
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <>
      <EnhancedAppBar />
      <Routes>
        <Route path="/" element={<EnhancedHomepage onGetStarted={handleGetStarted} />} />
        <Route 
          path="/login" 
          element={<ModernLoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/register" 
          element={<ModernRegisterPage onRegisterSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// Root App Component
function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ThemeProvider>
          <DocumentProvider>
            <Router>
              <AppRouter />
            </Router>
          </DocumentProvider>
        </ThemeProvider>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

export default App;
