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
  FormControlLabel,
  Checkbox,
  Paper
} from '@mui/material';
import { Warning, Gavel } from '@mui/icons-material';

interface PolicyConsentModalProps {
  open: boolean;
  onAccept: () => void;
}

const PolicyConsentModal: React.FC<PolicyConsentModalProps> = ({ open, onAccept }) => {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (checked) onAccept();
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          <Typography variant="h6">ZERO TOLERANCE AI POLICY DIRECTIVE</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Mandatory acknowledgment — required at every login.
          </Typography>
        </Alert>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Gavel fontSize="small" /> Strict Prohibition of AI in Technical Assessments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use of AI tools in technical assessments is strictly forbidden and may result in immediate and permanent withdrawal.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">Demonstrate Your Real Skills</Typography>
          <Typography variant="body2" color="text.secondary">
            You are training to be a skilled professional. Demonstrate your personal competence and authentic work.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">Zero Warning Policy</Typography>
          <Typography variant="body2" color="text.secondary">
            Detection of AI-generated content in submissions may trigger automatic termination with no exceptions and no refunds.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">Mutual Respect Principle</Typography>
          <Typography variant="body2" color="text.secondary">
            Respect instructors and assessment integrity. Do not attempt to game technical evaluations.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">Trust Is Your Certification</Typography>
          <Typography variant="body2" color="text.secondary">
            Your credential stands on your real skills. Keep your work honest.
          </Typography>
        </Paper>

        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
          label="I understand and solemnly agree: I will never use AI tools to complete, assist, or generate content for any technical lab, simulation, or hands-on assessment. I accept that violations may result in immediate permanent expulsion from the academy with no refunds. I commit to demonstrating my own capability in all assessments."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAccept} variant="contained" disabled={!checked}>
          Re-affirm & Continue to Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PolicyConsentModal;