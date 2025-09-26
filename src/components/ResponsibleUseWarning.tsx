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

const ResponsibleUseWarning: React.FC<ResponsibleUseWarningProps> = ({
  variant = 'compact',
  severity = 'warning',
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
        sx={{ mb: 2 }}
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {onOpenGuidelines && (
              <Button
                size="small"
                onClick={onOpenGuidelines}
                startIcon={<School />}
              >
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
        <AlertTitle>Responsible Use Reminder</AlertTitle>
        This tool is designed for writing improvement, not to circumvent academic integrity policies. 
        Always follow your institution's guidelines on AI assistance.
      </Alert>
    );
  }

  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security />
        Academic Integrity & Responsible Use
        <IconButton
          size="small"
          onClick={handleToggleExpanded}
          sx={{ ml: 'auto' }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </AlertTitle>
      
      <Typography variant="body2" paragraph>
        This AI humanization tool is designed to assist with writing improvement and learning. 
        Please use it responsibly and in accordance with academic integrity principles.
      </Typography>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Key Reminders:
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
            <strong>Appropriate Use:</strong> Improving clarity, learning writing techniques, 
            enhancing non-native language expression, preparing drafts for revision.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Inappropriate Use:</strong> Submitting AI content as original work, 
            circumventing detection for deception, violating institutional policies.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {onOpenGuidelines && (
              <Button
                size="small"
                variant="outlined"
                onClick={onOpenGuidelines}
                startIcon={<School />}
              >
                View Full Guidelines
              </Button>
            )}
            
            <Button
              size="small"
              variant="text"
              href="https://www.academicintegrity.org/"
              target="_blank"
              rel="noopener"
              startIcon={<Info />}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Collapse>

      {showDismiss && onDismiss && (
        <Box sx={{ mt: 2 }}>
          <Button size="small" onClick={onDismiss}>
            I Understand - Dismiss
          </Button>
        </Box>
      )}
    </Alert>
  );
};

export default ResponsibleUseWarning;