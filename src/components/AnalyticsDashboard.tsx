import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Description as DocumentIcon,
  Group as GroupIcon
} from '@mui/icons-material';

export const AnalyticsDashboard: React.FC = () => {
  const stats = {
    totalDocuments: 156,
    totalWords: 45230,
    avgWordsPerDoc: 290,
    collaborations: 23
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnalyticsIcon />
        Analytics Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DocumentIcon color="primary" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalDocuments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Documents
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon color="secondary" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalWords.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Words
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AnalyticsIcon color="success" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.avgWordsPerDoc}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Words/Doc
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon color="info" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.collaborations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collaborations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage Overview
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Document Processing
                </Typography>
                <LinearProgress variant="determinate" value={75} sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Collaboration Activity
                </Typography>
                <LinearProgress variant="determinate" value={60} sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API Usage
                </Typography>
                <LinearProgress variant="determinate" value={45} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};