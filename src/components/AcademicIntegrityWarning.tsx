import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Warning,
  School,
  Gavel,
  CheckCircle,
  Info,
  Close
} from '@mui/icons-material';

interface AcademicIntegrityWarningProps {
  onClose: () => void;
}

const AcademicIntegrityWarning: React.FC<AcademicIntegrityWarningProps> = ({ onClose }) => {
  const [showFullGuidelines, setShowFullGuidelines] = useState(false);

  const responsibleUses = [
    'Improving clarity and readability of your own original work',
    'Learning better writing techniques and academic language',
    'Enhancing personal understanding of complex topics',
    'Practicing paraphrasing and summarization skills',
    'Preparing drafts for personal review and revision'
  ];

  const prohibitedUses = [
    'Submitting AI-generated content as original work',
    'Bypassing plagiarism detection systems',
    'Violating institutional academic integrity policies',
    'Misrepresenting authorship of content',
    'Using for high-stakes assessments without permission'
  ];

  const bestPractices = [
    'Always disclose the use of AI assistance when required',
    'Use this tool to enhance your own ideas, not replace them',
    'Review and understand all content before submission',
    'Check your institution\'s AI usage policies',
    'Maintain academic honesty in all your work'
  ];

  return (
    <>
      <Alert 
        severity="warning" 
        sx={{ mb: 3 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setShowFullGuidelines(true)}
            >
              Read Guidelines
            </Button>
            <Button 
              color="inherit" 
              size="small" 
              onClick={onClose}
            >
              <Close />
            </Button>
          </Box>
        }
      >
        <AlertTitle>
          <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
          Academic Integrity Notice
        </AlertTitle>
        <Typography variant="body2">
          This tool is designed to help improve writing quality and readability. 
          Please use responsibly and in accordance with your institution's academic integrity policies.
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<School />} 
            label="Educational Use" 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            icon={<Gavel />} 
            label="Follow Policies" 
            size="small" 
            color="warning" 
            variant="outlined" 
          />
        </Box>
      </Alert>

      <Dialog 
        open={showFullGuidelines} 
        onClose={() => setShowFullGuidelines(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            Academic Integrity Guidelines
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Important Disclaimer</AlertTitle>
            This tool is intended for educational and writing improvement purposes. 
            Users are responsible for ensuring compliance with their institution's policies.
          </Alert>

          <Typography variant="h6" gutterBottom color="success.main">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            Responsible Uses
          </Typography>
          <List dense>
            {responsibleUses.map((use, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={use} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom color="error.main">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            Prohibited Uses
          </Typography>
          <List dense>
            {prohibitedUses.map((use, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Warning color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={use} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom color="primary.main">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            Best Practices
          </Typography>
          <List dense>
            {bestPractices.map((practice, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Info color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={practice} />
              </ListItem>
            ))}
          </List>

          <Alert severity="warning" sx={{ mt: 3 }}>
            <AlertTitle>Institution-Specific Policies</AlertTitle>
            <Typography variant="body2">
              Academic integrity policies vary by institution. Always consult your school's 
              specific guidelines regarding AI assistance, plagiarism, and academic honesty. 
              When in doubt, ask your instructor or academic advisor.
            </Typography>
          </Alert>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recommended Workflow:
            </Typography>
            <Typography variant="body2" component="div">
              1. Write your original content first<br />
              2. Use this tool to improve clarity and readability<br />
              3. Review and understand all changes<br />
              4. Cite AI assistance if required by your institution<br />
              5. Ensure final work represents your understanding
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowFullGuidelines(false)} variant="contained">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AcademicIntegrityWarning;