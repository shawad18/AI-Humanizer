import React, { useState, useEffect } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Alert,
  Chip,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { 
  AutoFixHigh, 
  Security,
  CheckCircle,
  Warning,
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
import TextStatistics from './components/TextStatistics';
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
// Services
import { humanizationEngine, HumanizationResult } from './services/humanizationEngine';
import { DetectionResult } from './services/detectionService';
import { advancedDetectionService } from './services/advancedDetectionService';
import { ExportData } from './services/exportService';
import { integrityService } from './services/integrityService';
import './App.css';

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

export interface HumanizationSettings {
  tone: 'formal' | 'academic' | 'casual' | 'technical' | 'creative' | 'professional';
  formalityLevel: number;
  subjectArea: string;
  preserveStructure: boolean;
  addTransitions: boolean;
  varyingSentenceLength: boolean;
  creativityLevel: number;
  vocabularyComplexity: number;
  sentenceComplexity: number;
  personalityStrength: number;
  targetAudience: 'general' | 'academic' | 'professional' | 'student' | 'expert';
  writingStyle: 'descriptive' | 'analytical' | 'persuasive' | 'narrative' | 'expository';
  aiDetectionAvoidance: number;
}

// Main App Component with Navigation
function MainApp() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('humanizer');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
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
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [humanizationResult, setHumanizationResult] = useState<HumanizationResult | null>(null);
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
      setHumanizationResult(result);
      
      // Log usage for transparency
      integrityService.logUsage('humanize', text.length, true);
    } catch (error) {
      console.error('Error humanizing text:', error);
      setHumanizationResult(null);
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

          <Paper elevation={2} sx={{ p: 2 }}>
            <TextStatistics
              originalText={originalText}
              humanizedText={humanizedText}
            />
          </Paper>
        </Grid>

        {/* Main Content - Text Editor */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Humanization Results Display */}
          {humanizationResult && (
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {humanizationResult.detectionRisk === 'low' ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Warning color={humanizationResult.detectionRisk === 'medium' ? 'warning' : 'error'} />
                  )}
                  <Typography variant="h6">
                    Humanization Complete
                  </Typography>
                </Box>
                <Chip 
                  label={`${humanizationResult.confidence}% Confidence`}
                  color={humanizationResult.confidence > 80 ? 'success' : humanizationResult.confidence > 60 ? 'primary' : 'warning'}
                  variant="filled"
                />
                <Chip 
                  label={`${humanizationResult.detectionRisk.toUpperCase()} Risk`}
                  color={humanizationResult.detectionRisk === 'low' ? 'success' : humanizationResult.detectionRisk === 'medium' ? 'warning' : 'error'}
                  variant="outlined"
                />
              </Box>
              
              <Alert 
                severity={humanizationResult.detectionRisk === 'low' ? 'success' : humanizationResult.detectionRisk === 'medium' ? 'warning' : 'error'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  {humanizationResult.detectionRisk === 'low' && 'Excellent! Your text has been successfully humanized with low AI detection risk.'}
                  {humanizationResult.detectionRisk === 'medium' && 'Good progress! Consider additional refinements to further reduce AI detection risk.'}
                  {humanizationResult.detectionRisk === 'high' && 'Warning: High AI detection risk detected. Consider adjusting settings and re-humanizing.'}
                </Typography>
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                Applied Techniques:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {humanizationResult.appliedTechniques.map((technique, index) => (
                  <Chip 
                    key={index}
                    label={technique}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Paper>
          )}

          <Paper elevation={2} sx={{ p: 2, minHeight: '70vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Document Editor
              </Typography>
              {humanizedText && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleOpenExport}
                  sx={{ ml: 2 }}
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
            <Box sx={{ mt: 3 }}>
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
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Navigation Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar>
            <AutoFixHigh sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap component="div">
              AI Humanizer
            </Typography>
          </Toolbar>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: currentView === item.id ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AppBar position="static" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {menuItems.find(item => item.id === currentView)?.label || 'AI Document Humanizer'}
              </Typography>
              
              {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <Avatar sx={{ width: 32, height: 32 }}>
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
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <AutoFixHigh sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
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
