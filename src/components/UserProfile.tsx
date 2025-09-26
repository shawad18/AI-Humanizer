import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDocuments } from '../contexts/DocumentContext';

export const UserProfile: React.FC = () => {
  const { user, logout, updateUser, updatePreferences } = useAuth();
  const { customTheme, updateCustomTheme } = useTheme();
  const { documents } = useDocuments();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleSave = () => {
    if (editedUser) {
      updateUser(editedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handlePreferenceChange = (key: keyof typeof user.preferences, value: any) => {
    updatePreferences({ [key]: value });
    if (key === 'theme') {
      updateCustomTheme({ mode: value });
    }
  };

  const handleThemeChange = (key: keyof typeof customTheme, value: any) => {
    updateCustomTheme({ [key]: value });
  };

  const getUsageStats = () => {
    const totalDocs = documents.length;
    const totalWords = documents.reduce((sum, doc) => sum + doc.metadata.wordCount, 0);
    const avgWordsPerDoc = totalDocs > 0 ? Math.round(totalWords / totalDocs) : 0;
    
    return { totalDocs, totalWords, avgWordsPerDoc };
  };

  const stats = getUsageStats();

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'premium': return 'primary';
      case 'enterprise': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editedUser?.name || ''}
                  onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h4" fontWeight="bold">
                  {user.name}
                </Typography>
              )}
              
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editedUser?.email || ''}
                  onChange={(e) => setEditedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  variant="outlined"
                  size="small"
                  type="email"
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
              )}
              
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={user.subscription.toUpperCase()}
                  color={getSubscriptionColor(user.subscription) as any}
                  size="small"
                />
              </Box>
            </Box>

            <Box>
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    size="small"
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            Usage Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stats.totalDocs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Documents Created
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" color="secondary" fontWeight="bold">
                  {stats.totalWords.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Words Processed
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.avgWordsPerDoc}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Words per Document
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={user.preferences.theme}
                label="Theme"
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto (System)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={user.preferences.language}
                label="Language"
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={user.preferences.autoSave}
                  onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                />
              }
              label="Auto-save documents"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={user.preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                />
              }
              label="Enable notifications"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Theme Customization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon />
            Theme Customization
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Primary Color"
              type="color"
              value={customTheme.primaryColor}
              onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
              sx={{ width: 120 }}
            />

            <TextField
              label="Secondary Color"
              type="color"
              value={customTheme.secondaryColor}
              onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
              sx={{ width: 120 }}
            />

            <FormControl sx={{ width: 150 }}>
              <InputLabel>Font Size</InputLabel>
              <Select
                value={customTheme.fontSize}
                label="Font Size"
                onChange={(e) => handleThemeChange('fontSize', e.target.value)}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" gutterBottom>
                Border Radius: {customTheme.borderRadius}px
              </Typography>
              <input
                aria-label="Border Radius"
                title="Adjust border radius"
                type="range"
                min="0"
                max="20"
                value={customTheme.borderRadius}
                onChange={(e) => handleThemeChange('borderRadius', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon />
            Account Actions
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Export Account Data
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              fullWidth
            >
              Change Password
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => setShowLogoutDialog(true)}
              fullWidth
            >
              Sign Out
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to sign out? Any unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              logout();
              setShowLogoutDialog(false);
            }}
            color="error"
            variant="contained"
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};