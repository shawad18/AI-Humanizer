import React from 'react';
import { Box, Container, Paper, Typography, Divider, Alert } from '@mui/material';
import { Warning, Gavel } from '@mui/icons-material';

const PolicyPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Zero Tolerance AI Policy — please read thoroughly.
          </Typography>
        </Alert>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Warning color="warning" />
            <Typography variant="h6">ZERO TOLERANCE AI POLICY DIRECTIVE</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Gavel /> Strict Prohibition of AI in Technical Assessments
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use of generative AI tools in technical labs or assessments is strictly forbidden and may result in immediate and permanent withdrawal.
          </Typography>

          <Typography variant="subtitle1">Demonstrate Your Real Skills</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You are here to develop your personal technical expertise. Your submissions must show your own understanding and capability.
          </Typography>

          <Typography variant="subtitle1">Zero Warning Policy</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            AI-generated content detection in submissions may trigger automatic termination. No exceptions, no refunds.
          </Typography>

          <Typography variant="subtitle1">Mutual Respect Principle</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Respect the integrity of instructors and the program. Do not attempt to game assessments.
          </Typography>

          <Typography variant="subtitle1">Trust Is Your Certification</Typography>
          <Typography variant="body2" color="text.secondary">
            Your credential represents your real skills. Keep your work honest.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PolicyPage;