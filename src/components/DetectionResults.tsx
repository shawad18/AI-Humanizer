import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import {
  ExpandMore,
  Security,
  ContentCopy,
  Warning,
  CheckCircle,
  Error,
  Info,
  Lightbulb
} from '@mui/icons-material';
import { DetectionResult } from '../services/detectionService';

interface DetectionResultsProps {
  result: DetectionResult | null;
  isLoading?: boolean;
}

const DetectionResults: React.FC<DetectionResultsProps> = ({ result, isLoading = false }) => {
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Analyzing Text...
        </Typography>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Running AI detection and plagiarism analysis...
        </Typography>
      </Paper>
    );
  }

  if (!result) {
    return null;
  }

  const getScoreColor = (score: number, reverse: boolean = false) => {
    if (reverse) {
      // For AI detection and plagiarism risk (lower is better)
      if (score < 30) return 'success';
      if (score < 60) return 'warning';
      return 'error';
    } else {
      // For readability and uniqueness (higher is better)
      if (score > 70) return 'success';
      if (score > 40) return 'warning';
      return 'error';
    }
  };

  const getScoreIcon = (score: number, reverse: boolean = false) => {
    const color = getScoreColor(score, reverse);
    switch (color) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getAlertSeverity = (aiScore: number, plagiarismRisk: number) => {
    if (aiScore > 70 || plagiarismRisk > 70) return 'error';
    if (aiScore > 50 || plagiarismRisk > 50) return 'warning';
    if (aiScore < 30 && plagiarismRisk < 30) return 'success';
    return 'info';
  };

  const getOverallMessage = (aiScore: number, plagiarismRisk: number) => {
    if (aiScore > 70 || plagiarismRisk > 70) {
      return 'High risk detected. Consider significant revisions before submission.';
    }
    if (aiScore > 50 || plagiarismRisk > 50) {
      return 'Moderate risk detected. Review recommendations and make improvements.';
    }
    if (aiScore < 30 && plagiarismRisk < 30) {
      return 'Low risk detected. Text appears to have good originality and human characteristics.';
    }
    return 'Analysis complete. Review detailed metrics below.';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security />
        Detection Analysis Results
      </Typography>

      {/* Overall Status Alert */}
      <Alert 
        severity={getAlertSeverity(result.aiDetectionScore, result.plagiarismRisk)}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          {getOverallMessage(result.aiDetectionScore, result.plagiarismRisk)}
        </Typography>
      </Alert>

      {/* Score Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {getScoreIcon(result.aiDetectionScore, true)}
                <Typography variant="h4" sx={{ ml: 1, color: `${getScoreColor(result.aiDetectionScore, true)}.main` }}>
                  {result.aiDetectionScore}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                AI Detection Score
              </Typography>
              <Typography variant="caption" display="block">
                Lower is better
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {getScoreIcon(result.plagiarismRisk, true)}
                <Typography variant="h4" sx={{ ml: 1, color: `${getScoreColor(result.plagiarismRisk, true)}.main` }}>
                  {result.plagiarismRisk}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Plagiarism Risk
              </Typography>
              <Typography variant="caption" display="block">
                Lower is better
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {getScoreIcon(result.readabilityScore)}
                <Typography variant="h4" sx={{ ml: 1, color: `${getScoreColor(result.readabilityScore)}.main` }}>
                  {Math.round(result.readabilityScore)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Readability Score
              </Typography>
              <Typography variant="caption" display="block">
                Higher is better
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {getScoreIcon(result.uniquenessScore)}
                <Typography variant="h4" sx={{ ml: 1, color: `${getScoreColor(result.uniquenessScore)}.main` }}>
                  {Math.round(result.uniquenessScore)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Uniqueness Score
              </Typography>
              <Typography variant="caption" display="block">
                Higher is better
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Detailed Analysis */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Quality Metrics</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="body2" gutterBottom>
                Lexical Diversity: {Math.round(result.detectionDetails.qualityMetrics.lexicalDiversity)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={result.detectionDetails.qualityMetrics.lexicalDiversity}
                color={getScoreColor(result.detectionDetails.qualityMetrics.lexicalDiversity)}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" gutterBottom>
                Sentence Variation: {Math.round(result.detectionDetails.qualityMetrics.sentenceVariation)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={result.detectionDetails.qualityMetrics.sentenceVariation}
                color={getScoreColor(result.detectionDetails.qualityMetrics.sentenceVariation)}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="body2" gutterBottom>
                Vocabulary Complexity: {Math.round(result.detectionDetails.qualityMetrics.vocabularyComplexity)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={result.detectionDetails.qualityMetrics.vocabularyComplexity}
                color={getScoreColor(result.detectionDetails.qualityMetrics.vocabularyComplexity)}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" gutterBottom>
                Coherence Score: {Math.round(result.detectionDetails.qualityMetrics.coherenceScore)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={result.detectionDetails.qualityMetrics.coherenceScore}
                color={getScoreColor(result.detectionDetails.qualityMetrics.coherenceScore)}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* AI Indicators */}
      {result.detectionDetails.aiIndicators.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">AI Detection Indicators</Typography>
            <Chip 
              label={result.detectionDetails.aiIndicators.length} 
              size="small" 
              color="warning" 
              sx={{ ml: 1 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {result.detectionDetails.aiIndicators.map((indicator, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={indicator} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Plagiarism Indicators */}
      {result.detectionDetails.plagiarismIndicators.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Plagiarism Risk Indicators</Typography>
            <Chip 
              label={result.detectionDetails.plagiarismIndicators.length} 
              size="small" 
              color="error" 
              sx={{ ml: 1 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {result.detectionDetails.plagiarismIndicators.map((indicator, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ContentCopy color="error" />
                  </ListItemIcon>
                  <ListItemText primary={indicator} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recommendations */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Recommendations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {result.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Lightbulb color="info" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default DetectionResults;