import React from 'react';
import { Card, CardContent, CardActions, Button, Typography, Box } from '@mui/material';
import { AutoFixHigh, School, BusinessCenter, Brush } from '@mui/icons-material';
import { HumanizationSettings } from '../types/humanization';

interface HumanizationPresetsProps {
  onApply: (partial: Partial<HumanizationSettings>) => void;
}

const presetCard = (
  title: string,
  description: string,
  icon: React.ReactNode,
  onClick: () => void
) => (
  <Card variant="outlined" sx={{ flex: '1 1 220px', minWidth: 220 }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={onClick} startIcon={<AutoFixHigh />}>
        Apply Preset
      </Button>
    </CardActions>
  </Card>
);

export const HumanizationPresets: React.FC<HumanizationPresetsProps> = ({ onApply }) => {
  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      {presetCard(
        'Academic',
        'Formal tone, structured exposition, strong detection avoidance.',
        <School color="primary" />,
        () => onApply({
          tone: 'academic',
          formalityLevel: 8,
          writingStyle: 'expository',
          aiDetectionAvoidance: 9,
          vocabularyComplexity: 7,
          sentenceComplexity: 6,
          preserveStructure: true,
          addTransitions: true,
        })
      )}
      {presetCard(
        'Business',
        'Clear, persuasive, concise language suitable for professional audiences.',
        <BusinessCenter color="secondary" />,
        () => onApply({
          tone: 'professional',
          formalityLevel: 7,
          writingStyle: 'persuasive',
          aiDetectionAvoidance: 8,
          vocabularyComplexity: 6,
          sentenceComplexity: 5,
          preserveStructure: true,
          addTransitions: true,
        })
      )}
      {presetCard(
        'Creative',
        'Expressive style, varied sentence length, more colorful vocabulary.',
        <Brush color="info" />,
        () => onApply({
          tone: 'creative',
          formalityLevel: 5,
          writingStyle: 'narrative',
          creativityLevel: 8,
          varyingSentenceLength: true,
          vocabularyComplexity: 7,
          sentenceComplexity: 6,
        })
      )}
    </Box>
  );
};

export default HumanizationPresets;