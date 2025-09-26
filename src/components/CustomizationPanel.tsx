import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AutoFixHigh,
  School,
  Business,
  Science,
  Psychology,
  ExpandMore,
  Palette,
  Work,
  Groups,
  Person,
  Create,
  Analytics,
  Description,
  Campaign,
  MenuBook,
  Article,
  Security,
  Tune
} from '@mui/icons-material';
import { HumanizationSettings } from '../App';

interface CustomizationPanelProps {
  settings: HumanizationSettings;
  onSettingsChange: (settings: HumanizationSettings) => void;
  onHumanize: () => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  isAnalyzing: boolean;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  settings,
  onSettingsChange,
  onHumanize,
  onAnalyze,
  isProcessing,
  isAnalyzing
}) => {
  const handleSettingChange = (key: keyof HumanizationSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const getFormalityLabel = (value: number) => {
    if (value <= 2) return 'Very Casual';
    if (value <= 4) return 'Casual';
    if (value <= 6) return 'Neutral';
    if (value <= 8) return 'Formal';
    return 'Very Formal';
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'academic': return <School />;
      case 'formal': return <Business />;
      case 'technical': return <Science />;
      case 'casual': return <Psychology />;
      case 'creative': return <Palette />;
      case 'professional': return <Work />;
      default: return <Psychology />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'academic': return <School />;
      case 'professional': return <Work />;
      case 'student': return <Person />;
      case 'expert': return <Science />;
      case 'general': return <Groups />;
      default: return <Groups />;
    }
  };

  const getWritingStyleIcon = (style: string) => {
    switch (style) {
      case 'descriptive': return <Description />;
      case 'analytical': return <Analytics />;
      case 'persuasive': return <Campaign />;
      case 'narrative': return <MenuBook />;
      case 'expository': return <Article />;
      default: return <Article />;
    }
  };

  const subjectAreas = [
    'general',
    'literature',
    'science',
    'technology',
    'business',
    'history',
    'psychology',
    'medicine',
    'law',
    'education',
    'philosophy',
    'economics',
    'engineering',
    'arts',
    'social-sciences'
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <Tune sx={{ mr: 1, verticalAlign: 'middle' }} />
        Humanization Settings
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Writing Style</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tone</InputLabel>
              <Select
                value={settings.tone}
                label="Tone"
                onChange={(e) => handleSettingChange('tone', e.target.value)}
              >
                <MenuItem value="academic">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School fontSize="small" />
                    Academic
                  </Box>
                </MenuItem>
                <MenuItem value="formal">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business fontSize="small" />
                    Formal
                  </Box>
                </MenuItem>
                <MenuItem value="technical">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Science fontSize="small" />
                    Technical
                  </Box>
                </MenuItem>
                <MenuItem value="casual">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology fontSize="small" />
                    Casual
                  </Box>
                </MenuItem>
                <MenuItem value="creative">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Palette fontSize="small" />
                    Creative
                  </Box>
                </MenuItem>
                <MenuItem value="professional">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work fontSize="small" />
                    Professional
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>
              Formality Level: {getFormalityLabel(settings.formalityLevel)}
            </Typography>
            <Slider
              value={settings.formalityLevel}
              onChange={(_, value) => handleSettingChange('formalityLevel', value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Subject Area</InputLabel>
              <Select
                value={settings.subjectArea}
                label="Subject Area"
                onChange={(e) => handleSettingChange('subjectArea', e.target.value)}
              >
                {subjectAreas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area.charAt(0).toUpperCase() + area.slice(1).replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={settings.targetAudience}
                label="Target Audience"
                onChange={(e) => handleSettingChange('targetAudience', e.target.value)}
              >
                <MenuItem value="general">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Groups fontSize="small" />
                    General Public
                  </Box>
                </MenuItem>
                <MenuItem value="academic">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School fontSize="small" />
                    Academic Community
                  </Box>
                </MenuItem>
                <MenuItem value="professional">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work fontSize="small" />
                    Professional Audience
                  </Box>
                </MenuItem>
                <MenuItem value="student">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" />
                    Students
                  </Box>
                </MenuItem>
                <MenuItem value="expert">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Science fontSize="small" />
                    Subject Experts
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Writing Style</InputLabel>
              <Select
                value={settings.writingStyle}
                label="Writing Style"
                onChange={(e) => handleSettingChange('writingStyle', e.target.value)}
              >
                <MenuItem value="descriptive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description fontSize="small" />
                    Descriptive
                  </Box>
                </MenuItem>
                <MenuItem value="analytical">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics fontSize="small" />
                    Analytical
                  </Box>
                </MenuItem>
                <MenuItem value="persuasive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Campaign fontSize="small" />
                    Persuasive
                  </Box>
                </MenuItem>
                <MenuItem value="narrative">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBook fontSize="small" />
                    Narrative
                  </Box>
                </MenuItem>
                <MenuItem value="expository">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Article fontSize="small" />
                    Expository
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Fine-Tuning Controls</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Creativity Level: {settings.creativityLevel}/10
            </Typography>
            <Slider
              value={settings.creativityLevel}
              onChange={(_, value) => handleSettingChange('creativityLevel', value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>
              Vocabulary Complexity: {settings.vocabularyComplexity}/10
            </Typography>
            <Slider
              value={settings.vocabularyComplexity}
              onChange={(_, value) => handleSettingChange('vocabularyComplexity', value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>
              Sentence Complexity: {settings.sentenceComplexity}/10
            </Typography>
            <Slider
              value={settings.sentenceComplexity}
              onChange={(_, value) => handleSettingChange('sentenceComplexity', value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>
              Personality Strength: {settings.personalityStrength}/10
            </Typography>
            <Slider
              value={settings.personalityStrength}
              onChange={(_, value) => handleSettingChange('personalityStrength', value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>
              AI Detection Avoidance: {settings.aiDetectionAvoidance}/10
            </Typography>
            <Slider
              value={settings.aiDetectionAvoidance}
              onChange={(_, value) => handleSettingChange('aiDetectionAvoidance', value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Advanced Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.preserveStructure}
                  onChange={(e) => handleSettingChange('preserveStructure', e.target.checked)}
                />
              }
              label="Preserve Document Structure"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.addTransitions}
                  onChange={(e) => handleSettingChange('addTransitions', e.target.checked)}
                />
              }
              label="Add Academic Transitions"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.varyingSentenceLength}
                  onChange={(e) => handleSettingChange('varyingSentenceLength', e.target.checked)}
                />
              }
              label="Vary Sentence Length"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Current Settings:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={getToneIcon(settings.tone)}
            label={settings.tone.charAt(0).toUpperCase() + settings.tone.slice(1)}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Formality: ${settings.formalityLevel}/10`}
            size="small"
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={getAudienceIcon(settings.targetAudience)}
            label={settings.targetAudience.charAt(0).toUpperCase() + settings.targetAudience.slice(1)}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={getWritingStyleIcon(settings.writingStyle)}
            label={settings.writingStyle.charAt(0).toUpperCase() + settings.writingStyle.slice(1)}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Create />}
            label={`Creativity: ${settings.creativityLevel}/10`}
            size="small"
            color="info"
            variant="outlined"
          />
          <Chip
            icon={<Security />}
            label={`AI Avoidance: ${settings.aiDetectionAvoidance}/10`}
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        onClick={onAnalyze}
        disabled={isAnalyzing}
        startIcon={isAnalyzing ? undefined : <Analytics />}
        sx={{ mt: 2 }}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={onHumanize}
        disabled={isProcessing}
        startIcon={isProcessing ? undefined : <AutoFixHigh />}
        sx={{ mt: 1 }}
      >
        {isProcessing ? 'Humanizing...' : 'Humanize Text'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Tip: Adjust settings based on your target audience and document purpose.
      </Typography>
    </Box>
  );
};

export default CustomizationPanel;