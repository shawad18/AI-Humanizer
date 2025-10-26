import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Remove,
  CheckCircle,
  Warning
} from '@mui/icons-material';

interface TextStatisticsProps {
  originalText: string;
  humanizedText: string;
}

interface TextMetrics {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  readabilityScore: number;
  complexityScore: number;
}

const TextStatistics: React.FC<TextStatisticsProps> = ({ originalText, humanizedText }) => {
  const calculateMetrics = (text: string): TextMetrics => {
    if (!text.trim()) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        averageWordsPerSentence: 0,
        readabilityScore: 0,
        complexityScore: 0
      };
    }

    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const characterCount = text.length;
    const paragraphCount = paragraphs.length;
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Simple readability score (based on average sentence length)
    const readabilityScore = Math.max(0, Math.min(100, 100 - (averageWordsPerSentence - 15) * 2));
    
    // Complexity score based on word length and sentence structure
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    const complexityScore = Math.min(100, (averageWordLength * 10) + (averageWordsPerSentence * 2));

    return {
      wordCount,
      sentenceCount,
      characterCount,
      paragraphCount,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      readabilityScore: Math.round(readabilityScore),
      complexityScore: Math.round(complexityScore)
    };
  };

  const originalMetrics = calculateMetrics(originalText);
  const humanizedMetrics = calculateMetrics(humanizedText);

  const getChangeIcon = (original: number, humanized: number) => {
    if (humanized > original) return <TrendingUp color="success" fontSize="small" />;
    if (humanized < original) return <TrendingDown color="error" fontSize="small" />;
    return <Remove color="disabled" fontSize="small" />;
  };

  const getChangeColor = (original: number, humanized: number) => {
    if (humanized > original) return 'success.main';
    if (humanized < original) return 'error.main';
    return 'text.secondary';
  };

  const getPercentageChange = (original: number, humanized: number) => {
    if (original === 0) return 0;
    return Math.round(((humanized - original) / original) * 100);
  };

  const getHumanizationQuality = () => {
    if (!humanizedText.trim()) return { score: 0, label: 'No data', color: 'default' as const };
    
    const readabilityImprovement = humanizedMetrics.readabilityScore - originalMetrics.readabilityScore;
    const complexityReduction = originalMetrics.complexityScore - humanizedMetrics.complexityScore;
    const sentenceVariation = Math.abs(humanizedMetrics.averageWordsPerSentence - 20); // Ideal around 20 words
    
    let score = 50; // Base score
    score += readabilityImprovement * 0.5;
    score += complexityReduction * 0.3;
    score -= sentenceVariation * 2;
    score = Math.max(0, Math.min(100, score));
    
    if (score >= 80) return { score, label: 'Excellent', color: 'success' as const };
    if (score >= 60) return { score, label: 'Good', color: 'primary' as const };
    if (score >= 40) return { score, label: 'Fair', color: 'warning' as const };
    return { score, label: 'Needs Improvement', color: 'error' as const };
  };

  const quality = getHumanizationQuality();

  const StatItem = ({ 
    label, 
    original, 
    humanized, 
    unit = '' 
  }: { 
    label: string; 
    original: number; 
    humanized: number; 
    unit?: string; 
  }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1">
          {original}{unit} → {humanized}{unit}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getChangeIcon(original, humanized)}
          <Typography 
            variant="caption" 
            sx={{ color: getChangeColor(original, humanized) }}
          >
            {getPercentageChange(original, humanized) > 0 ? '+' : ''}{getPercentageChange(original, humanized)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
        Text Statistics
      </Typography>

      {humanizedText.trim() && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {quality.score >= 60 ? (
              <CheckCircle sx={{ color: 'text.secondary' }} />
            ) : (
              <Warning sx={{ color: 'text.secondary' }} />
            )}
            <Typography variant="subtitle2" color="text.primary">
              Humanization Quality: {quality.label}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={quality.score} 
            color="primary"
            sx={{ height: 4, borderRadius: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {Math.round(quality.score)}% - Based on readability, complexity, and sentence variation
          </Typography>
        </Paper>
      )}

      {originalText.trim() ? (
        <Box>
          <StatItem
            label="Word Count"
            original={originalMetrics.wordCount}
            humanized={humanizedMetrics.wordCount}
          />
          
          <StatItem
            label="Sentence Count"
            original={originalMetrics.sentenceCount}
            humanized={humanizedMetrics.sentenceCount}
          />
          
          <StatItem
            label="Character Count"
            original={originalMetrics.characterCount}
            humanized={humanizedMetrics.characterCount}
          />
          
          <StatItem
            label="Avg. Words/Sentence"
            original={originalMetrics.averageWordsPerSentence}
            humanized={humanizedMetrics.averageWordsPerSentence}
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Readability Score
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={humanizedMetrics.readabilityScore} 
              color="primary"
              sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              {originalMetrics.readabilityScore}% → {humanizedMetrics.readabilityScore}%
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Complexity Score
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={100 - humanizedMetrics.complexityScore} 
              color="primary"
              sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              {originalMetrics.complexityScore}% → {humanizedMetrics.complexityScore}% (lower is better)
            </Typography>
          </Box>

          {humanizedText.trim() && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Improvements Made:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {humanizedMetrics.readabilityScore > originalMetrics.readabilityScore && (
                  <Chip label="Better Readability" size="small" color="success" variant="outlined" />
                )}
                {humanizedMetrics.complexityScore < originalMetrics.complexityScore && (
                  <Chip label="Reduced Complexity" size="small" color="success" variant="outlined" />
                )}
                {Math.abs(humanizedMetrics.averageWordsPerSentence - 20) < Math.abs(originalMetrics.averageWordsPerSentence - 20) && (
                  <Chip label="Better Sentence Flow" size="small" color="primary" variant="outlined" />
                )}
                {humanizedMetrics.wordCount !== originalMetrics.wordCount && (
                  <Chip label="Content Variation" size="small" color="info" variant="outlined" />
                )}
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Upload or paste text to see statistics
        </Typography>
      )}
    </Box>
  );
};

export default TextStatistics;