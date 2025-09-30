// Mobile-Optimized App Component with Touch-Friendly Interactions
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  TextFields as HumanizeIcon,
  FindInPage as DetectIcon,
  FileDownload as ExportIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  CloudUpload as UploadIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { pwaService } from '../services/pwaService';

interface MobileOptimizedAppProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  notifications?: number;
}

const MobileOptimizedApp: React.FC<MobileOptimizedAppProps> = ({
  children,
  currentPage,
  onPageChange,
  notifications = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(currentPage);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Swipe gestures for navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !drawerOpen) {
        // Navigate to next page
        const pages = ['home', 'humanize', 'detect', 'export', 'analytics'];
        const currentIndex = pages.indexOf(currentPage);
        const nextIndex = (currentIndex + 1) % pages.length;
        onPageChange(pages[nextIndex]);
      }
    },
    onSwipedRight: () => {
      if (isMobile && !drawerOpen) {
        // Navigate to previous page or open drawer
        if (currentPage === 'home') {
          setDrawerOpen(true);
        } else {
          const pages = ['home', 'humanize', 'detect', 'export', 'analytics'];
          const currentIndex = pages.indexOf(currentPage);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : pages.length - 1;
          onPageChange(pages[prevIndex]);
        }
      }
    },
    onSwipedDown: () => {
      if (isMobile) {
        // Refresh current page
        window.location.reload();
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50
  });

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen]);

  const handleBottomNavChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setBottomNavValue(newValue);
    onPageChange(newValue);
  }, [onPageChange]);

  const handleInstallApp = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setShowInstallBanner(false);
      }
    }
  }, [installPrompt]);

  const speedDialActions = [
    { icon: <HumanizeIcon />, name: 'Humanize Text', action: () => onPageChange('humanize') },
    { icon: <DetectIcon />, name: 'AI Detection', action: () => onPageChange('detect') },
    { icon: <UploadIcon />, name: 'Upload Document', action: () => pwaService.shareFile() },
    { icon: <ShareIcon />, name: 'Share', action: () => pwaService.shareContent({ text: 'Check out AI Humanizer!' }) }
  ];

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, value: 'home' },
    { text: 'Humanize', icon: <HumanizeIcon />, value: 'humanize' },
    { text: 'AI Detection', icon: <DetectIcon />, value: 'detect' },
    { text: 'Export', icon: <ExportIcon />, value: 'export' },
    { text: 'Analytics', icon: <AnalyticsIcon />, value: 'analytics' },
    { text: 'Settings', icon: <SettingsIcon />, value: 'settings' },
    { text: 'Profile', icon: <ProfileIcon />, value: 'profile' }
  ];

  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.value} disablePadding sx={{ mx: 1, mb: 0.5 }}>
            <ListItemButton
              selected={currentPage === item.value}
              onClick={() => {
                onPageChange(item.value);
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText
                  }
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* PWA Install Button */}
      {showInstallBanner && (
        <Box sx={{ p: 2, mt: 2, mx: 1, backgroundColor: theme.palette.background.paper, borderRadius: 2 }}>
          <Typography variant="body2" gutterBottom>
            Install AI Humanizer for a better experience
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton
              size="small"
              onClick={handleInstallApp}
              sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setShowInstallBanner(false)}
            >
              ×
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }} {...swipeHandlers}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            AI Humanizer
          </Typography>

          {/* Online/Offline Indicator */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isOnline ? 'success.main' : 'error.main',
              mr: 1
            }}
          />

          {/* Notifications */}
          <IconButton>
            <Badge badgeContent={notifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Search */}
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        swipeAreaWidth={20}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
      >
        {drawerContent}
      </SwipeableDrawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Account for AppBar height
          pb: isMobile ? 8 : 2, // Account for BottomNavigation on mobile
          px: isMobile ? 1 : 2,
          overflow: 'auto',
          backgroundColor: theme.palette.background.default
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: theme.palette.background.paper
          }}
        >
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Humanize"
            value="humanize"
            icon={<HumanizeIcon />}
          />
          <BottomNavigationAction
            label="Detect"
            value="detect"
            icon={<DetectIcon />}
          />
          <BottomNavigationAction
            label="Export"
            value="export"
            icon={<ExportIcon />}
          />
          <BottomNavigationAction
            label="More"
            value="analytics"
            icon={<AnalyticsIcon />}
          />
        </BottomNavigation>
      )}

      {/* Speed Dial (Tablet and Desktop) */}
      {!isMobile && (
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onOpen={() => setSpeedDialOpen(true)}
          onClose={() => setSpeedDialOpen(false)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.action();
                setSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Floating Action Button (Mobile Only) */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80, // Above bottom navigation
            right: 16,
            zIndex: theme.zIndex.speedDial
          }}
          onClick={() => onPageChange('humanize')}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Offline Notification */}
      <Snackbar
        open={!isOnline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          You're offline. Some features may not be available.
        </Alert>
      </Snackbar>

      {/* Install App Banner */}
      <Snackbar
        open={showInstallBanner && !isMobile}
        autoHideDuration={10000}
        onClose={() => setShowInstallBanner(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          action={
            <Box>
              <IconButton
                size="small"
                onClick={handleInstallApp}
                sx={{ color: 'white', mr: 1 }}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setShowInstallBanner(false)}
                sx={{ color: 'white' }}
              >
                ×
              </IconButton>
            </Box>
          }
        >
          Install AI Humanizer for a better experience
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileOptimizedApp;