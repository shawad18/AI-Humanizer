import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Link
} from '@mui/material';
import {
  Security,
  School,
  Warning,
  CheckCircle,
  ExpandMore,
  Gavel,
  Info,
  Assignment,
  Group,
  Psychology
} from '@mui/icons-material';

interface AcademicIntegrityDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const AcademicIntegrityDialog: React.FC<AcademicIntegrityDialogProps> = ({
  open,
  onClose,
  onAccept
}) => {
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);
  const [acceptsResponsibility, setAcceptsResponsibility] = useState(false);

  const handleAccept = () => {
    if (hasReadGuidelines && acceptsResponsibility) {
      onAccept();
      onClose();
    }
  };

  const canAccept = hasReadGuidelines && acceptsResponsibility;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Security color="warning" />
          <Typography variant="h6">Academic Integrity & Responsible Use</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> This tool is designed to assist with writing improvement, not to circumvent academic integrity policies. 
            Please read and understand these guidelines before proceeding.
          </Typography>
        </Alert>

        {/* Core Principles */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            Core Academic Integrity Principles
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Honesty in Academic Work"
                secondary="All submitted work should represent your own understanding and effort"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Proper Attribution"
                secondary="Always cite sources and acknowledge assistance received"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Institutional Compliance"
                secondary="Follow your institution's specific policies on AI tool usage"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Detailed Guidelines */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel color="primary" />
          Detailed Guidelines
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Assignment color="primary" />
              <Typography variant="subtitle1">Appropriate Use Cases</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Improving clarity and readability of your own writing" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Learning better writing techniques and styles" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Enhancing non-native language expression" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Preparing drafts for further personal revision" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Professional document improvement (with disclosure)" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Warning color="error" />
              <Typography variant="subtitle1">Inappropriate Use Cases</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon><Warning color="error" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Submitting AI-generated content as original work" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="error" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Circumventing AI detection for deceptive purposes" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="error" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Violating institutional policies on AI assistance" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="error" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Using for high-stakes assessments without permission" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="error" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Misrepresenting the source or nature of your work" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Group color="primary" />
              <Typography variant="subtitle1">Institutional Considerations</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Different institutions have varying policies regarding AI assistance:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Check your institution's AI policy before use" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon>
                <ListItemText primary="When in doubt, ask your instructor or supervisor" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Consider disclosing AI assistance even when not required" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Maintain records of your original work and revisions" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Psychology color="primary" />
              <Typography variant="subtitle1">Best Practices</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Use as a learning tool, not a replacement for thinking"
                  secondary="Understand and review all changes made to your text"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Maintain your authentic voice and ideas"
                  secondary="Ensure the final work reflects your understanding"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Document your process"
                  secondary="Keep records of original drafts and revision history"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Be transparent about assistance"
                  secondary="Disclose AI assistance when submitting work"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 3 }} />

        {/* Legal and Ethical Notice */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Legal Notice:</strong> Users are solely responsible for ensuring their use of this tool 
            complies with applicable laws, institutional policies, and ethical standards. This tool does not 
            provide legal advice or guarantee compliance with any specific requirements.
          </Typography>
        </Alert>

        {/* Resources */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Additional Resources:
          </Typography>
          <Typography variant="body2">
            • <Link href="https://www.academicintegrity.org/" target="_blank" rel="noopener">
              International Center for Academic Integrity
            </Link>
            <br />
            • <Link href="https://www.turnitin.com/blog/academic-integrity-in-the-age-of-ai" target="_blank" rel="noopener">
              Academic Integrity in the Age of AI
            </Link>
            <br />
            • Consult your institution's academic integrity office
          </Typography>
        </Box>

        {/* Acknowledgment Checkboxes */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Required Acknowledgments:
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={hasReadGuidelines}
                onChange={(e) => setHasReadGuidelines(e.target.checked)}
              />
            }
            label="I have read and understand the academic integrity guidelines above"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptsResponsibility}
                onChange={(e) => setAcceptsResponsibility(e.target.checked)}
              />
            }
            label="I accept responsibility for using this tool ethically and in compliance with applicable policies"
            sx={{ display: 'block', mt: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAccept}
          disabled={!canAccept}
          startIcon={<CheckCircle />}
        >
          I Understand & Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcademicIntegrityDialog;