import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Chip
} from '@mui/material';
import {
  Warning,
  ExpandMore,
  ExpandLess,
  School,
  Security,
  Info
} from '@mui/icons-material';

interface ResponsibleUseWarningProps {
  variant?: 'compact' | 'detailed';
  severity?: 'warning' | 'info' | 'error';
  onOpenGuidelines?: () => void;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

const baseAlertSx = {
  mb: 2,
  bgcolor: 'background.paper',
  borderColor: 'divider',
  color: 'text.secondary',
  '& .MuiAlert-icon': { color: 'text.secondary' },
  '& .MuiAlert-action': { color: 'text.secondary' },
};

const ResponsibleUseWarning: React.FC<ResponsibleUseWarningProps> = ({
  variant = 'compact',
  severity = 'info',
  onOpenGuidelines,
  showDismiss = false,
  onDismiss
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (variant === 'compact') {
    return (
      <Alert 
        severity={severity}
        variant="outlined"
        sx={baseAlertSx}
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {onOpenGuidelines && (
              <Button size="small" onClick={onOpenGuidelines}>
                Guidelines
              </Button>
            )}
            {showDismiss && onDismiss && (
              <Button size="small" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 600, color: 'text.primary' }}>Responsible Use</AlertTitle>
        <Typography variant="body2">
          Use this tool to improve writing and learning. Always follow your institution’s policies.
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity={severity} variant="outlined" sx={baseAlertSx}>
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, color: 'text.primary' }}>
        <Security sx={{ color: 'text.secondary' }} />
        Academic Integrity & Responsible Use
        <IconButton size="small" onClick={handleToggleExpanded} sx={{ ml: 'auto' }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </AlertTitle>
      
      <Typography variant="body2" paragraph>
        This AI humanization tool supports better writing. Please use it responsibly and in line with academic integrity.
      </Typography>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="text.primary">
            Key Reminders
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<School />}
              label="Check Institution Policies"
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              icon={<Warning />}
              label="Disclose AI Assistance"
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              icon={<Info />}
              label="Maintain Original Ideas"
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          </Box>

          <Typography variant="body2" paragraph>
            Appropriate: improving clarity, learning techniques, enhancing expression, preparing drafts for revision.
          </Typography>

          <Typography variant="body2" paragraph>
            Not appropriate: submitting AI content as original work, circumventing detection, violating policies.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {onOpenGuidelines && (
              <Button size="small" variant="text" onClick={onOpenGuidelines}>
                View Guidelines
              </Button>
            )}
            <Button size="small" variant="text" href="https://www.academicintegrity.org/" target="_blank" rel="noopener">
              Learn More
            </Button>
          </Box>
        </Box>
      </Collapse>

      {showDismiss && onDismiss && (
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={onDismiss}>
            I Understand — Dismiss
          </Button>
        </Box>
      )}
    </Alert>
  );
};

export default ResponsibleUseWarning;