export interface DetectionResult {
  isAIGenerated: boolean;
  confidence: number; // 0-100, confidence in the detection
  riskLevel: 'low' | 'medium' | 'high';
  detectedPatterns: string[];
  suggestions: string[];
  // Legacy properties for backward compatibility
  aiDetectionScore?: number;
  plagiarismRisk?: number;
  readabilityScore?: number;
  uniquenessScore?: number;
  detectionDetails?: {
    aiIndicators: string[];
    plagiarismIndicators: string[];
    qualityMetrics: {
      lexicalDiversity: number;
      sentenceVariation: number;
      vocabularyComplexity: number;
      coherenceScore: number;
    };
  };
  recommendations?: string[];
}

export class TextDetectionService {
  private aiPatterns = [
    /\b(furthermore|moreover|additionally|consequently)\b/gi,
    /\b(it is important to note|it should be noted)\b/gi,
    /\b(in conclusion|to summarize|in summary)\b/gi,
    /\b(various|numerous|several|multiple)\b/gi,
    /\b(utilize|facilitate|implement|demonstrate)\b/gi,
    /\b(comprehensive|extensive|significant|substantial)\b/gi,
    /\b(approach|methodology|framework|strategy)\b/gi,
    /\b(enhance|optimize|streamline|leverage)\b/gi
  ];

  private commonPhrases = [
    'in today\'s world',
    'it is worth noting',
    'plays a crucial role',
    'of utmost importance',
    'cannot be overstated',
    'in recent years',
    'cutting-edge technology',
    'state-of-the-art',
    'paradigm shift',
    'game-changer'
  ];

  async analyzeText(text: string): Promise<DetectionResult> {
    // Handle null, undefined, or empty text
    if (!text || text.trim().length === 0) {
      return {
        isAIGenerated: false,
        confidence: 0,
        riskLevel: 'low',
        detectedPatterns: [],
        suggestions: [],
        aiDetectionScore: 0,
        plagiarismRisk: 0,
        readabilityScore: 0,
        uniquenessScore: 0,
        detectionDetails: {
          aiIndicators: [],
          plagiarismIndicators: [],
          qualityMetrics: {
            lexicalDiversity: 0,
            sentenceVariation: 0,
            vocabularyComplexity: 0,
            coherenceScore: 0
          }
        },
        recommendations: []
      };
    }

    const aiScore = this.calculateAIDetectionScore(text);
    const plagiarismRisk = this.calculatePlagiarismRisk(text);
    const readability = this.calculateReadabilityScore(text);
    const uniqueness = this.calculateUniquenessScore(text);
    
    const qualityMetrics = this.calculateQualityMetrics(text);
    const aiIndicators = this.findAIIndicators(text);
    const plagiarismIndicators = this.findPlagiarismIndicators(text);
    const recommendations = this.generateRecommendations(aiScore, plagiarismRisk, qualityMetrics);

    // Convert to new interface format
    const isAIGenerated = aiScore > 50;
    const confidence = aiScore;
    const riskLevel: 'low' | 'medium' | 'high' = 
      aiScore < 40 ? 'low' : 
      aiScore < 65 ? 'medium' : 'high';
    
    const detectedPatterns = [...aiIndicators, ...plagiarismIndicators];
    const suggestions = recommendations;

    return {
      isAIGenerated,
      confidence,
      riskLevel,
      detectedPatterns,
      suggestions,
      // Legacy properties for backward compatibility
      aiDetectionScore: aiScore,
      plagiarismRisk,
      readabilityScore: readability,
      uniquenessScore: uniqueness,
      detectionDetails: {
        aiIndicators,
        plagiarismIndicators,
        qualityMetrics
      },
      recommendations
    };
  }

  private calculateAIDetectionScore(text: string): number {
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    // Check for AI patterns (more aggressive scoring)
    this.aiPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 12; // Increased from 5 to 12
      }
    });

    // Check for specific high-scoring AI words
    const highScoreAIWords = [
      'furthermore', 'moreover', 'additionally', 'consequently',
      'comprehensive', 'systematic', 'strategic', 'optimal',
      'implementation', 'methodology', 'utilization', 'facilitate',
      'substantial', 'demonstrates', 'ensures', 'maximizes'
    ];
    
    highScoreAIWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length * 15; // High score for these specific words
      }
    });

    // Check sentence uniformity (AI tends to generate uniform sentences)
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    
    if (variance < 10) score += 20; // Increased from 15
    if (avgLength > 15 && avgLength < 25) score += 15; // Increased from 10

    // Check for repetitive vocabulary
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    if (lexicalDiversity < 0.4) score += 25; // Increased from 20

    // Check for common AI phrases
    this.commonPhrases.forEach(phrase => {
      if (text.toLowerCase().includes(phrase)) {
        score += 12; // Increased from 8
      }
    });

    // Check for overly formal language patterns
    const formalWords = ['utilize', 'facilitate', 'implement', 'demonstrate', 'comprehensive'];
    const formalCount = formalWords.reduce((count, word) => {
      return count + (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    if (formalCount > words.length * 0.02) score += 15;

    // Check for human-like characteristics (reduce score)
    const humanMarkers = [
      /\b(omg|lol|wow|hey|yeah|nah|gonna|wanna|gotta)\b/gi,
      /\b(you know|i mean|like|actually|honestly|frankly)\b/gi,
      /[!]{1,3}|[?]{1,3}/g, // Emotional punctuation
      /\b(i'm|you're|we're|they're|can't|won't|don't)\b/gi // Contractions
    ];

    let humanScore = 0;
    humanMarkers.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        humanScore += matches.length * 8;
      }
    });

    // Check for personal pronouns and conversational tone
    const personalPronouns = text.match(/\b(I|me|my|you|your|we|us|our)\b/gi);
    if (personalPronouns && personalPronouns.length > 0) {
      humanScore += personalPronouns.length * 3;
    }

    // Check for questions and exclamations (human characteristics)
    const questions = text.match(/\?/g);
    const exclamations = text.match(/!/g);
    if (questions) humanScore += questions.length * 5;
    if (exclamations) humanScore += exclamations.length * 3;

    // Subtract human score from AI score
    score = Math.max(0, score - humanScore);

    return Math.min(100, Math.max(0, score));
  }

  private calculatePlagiarismRisk(text: string): number {
    let risk = 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    // Check for exact phrase repetition
    const phrases = [];
    for (let i = 0; i < sentences.length; i++) {
      const words = sentences[i].trim().split(/\s+/);
      for (let j = 0; j < words.length - 4; j++) {
        phrases.push(words.slice(j, j + 5).join(' ').toLowerCase());
      }
    }

    const uniquePhrases = new Set(phrases);
    const repetitionRate = 1 - (uniquePhrases.size / phrases.length);
    risk += repetitionRate * 50;

    // Check for academic clichés that might indicate copying
    const academicCliches = [
      'since the dawn of time',
      'throughout history',
      'in today\'s society',
      'in this day and age',
      'it goes without saying'
    ];

    academicCliches.forEach(cliche => {
      if (text.toLowerCase().includes(cliche)) {
        risk += 10;
      }
    });

    // Check for unusual formatting or structure that might indicate copying
    const hasUnusualSpacing = /\s{3,}/.test(text);
    const hasInconsistentPunctuation = /[.]{2,}|[!]{2,}|[?]{2,}/.test(text);
    
    if (hasUnusualSpacing) risk += 15;
    if (hasInconsistentPunctuation) risk += 10;

    return Math.min(100, Math.max(0, risk));
  }

  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const syllables = this.countSyllables(text);

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    // Convert to 0-100 scale where higher is better
    return Math.min(100, Math.max(0, fleschScore));
  }

  private calculateUniquenessScore(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;

    // Check for creative language use
    const creativeWords = ['metaphor', 'analogy', 'symbolism', 'imagery'];
    const creativeCount = creativeWords.reduce((count, word) => {
      return count + (text.toLowerCase().includes(word) ? 1 : 0);
    }, 0);

    let uniqueness = lexicalDiversity * 70;
    uniqueness += creativeCount * 5;

    // Bonus for varied sentence structures
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const sentenceStarters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const uniqueStarters = new Set(sentenceStarters);
    const starterDiversity = uniqueStarters.size / sentenceStarters.length;
    
    uniqueness += starterDiversity * 20;

    return Math.min(100, Math.max(0, uniqueness));
  }

  private calculateQualityMetrics(text: string) {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const uniqueWords = new Set(words);

    const lexicalDiversity = uniqueWords.size / words.length;
    
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    const sentenceVariation = Math.min(100, variance * 2);

    const complexWords = words.filter(word => this.countSyllables(word) > 2).length;
    const vocabularyComplexity = (complexWords / words.length) * 100;

    // Simple coherence check based on transition words
    const transitions = ['however', 'therefore', 'furthermore', 'meanwhile', 'consequently'];
    const transitionCount = transitions.reduce((count, transition) => {
      return count + (text.toLowerCase().includes(transition) ? 1 : 0);
    }, 0);
    const coherenceScore = Math.min(100, (transitionCount / sentences.length) * 200);

    return {
      lexicalDiversity: lexicalDiversity * 100,
      sentenceVariation,
      vocabularyComplexity,
      coherenceScore
    };
  }

  private findAIIndicators(text: string): string[] {
    const indicators: string[] = [];

    // Check for GPT-like patterns
    const gptPatterns = [
      /\b(furthermore|moreover|additionally|consequently)\b/gi,
      /\b(comprehensive|systematic|strategic|optimal)\b/gi,
      /\b(implementation|methodology|utilization|facilitate)\b/gi
    ];
    
    let gptMatches = 0;
    gptPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) gptMatches += matches.length;
    });
    
    if (gptMatches >= 3) {
      indicators.push('gpt_patterns');
    }

    // Check for academic style
    const academicPatterns = [
      /\b(this study|the methodology|the findings|the research)\b/gi,
      /\b(examines|indicates|demonstrates|reveals)\b/gi,
      /\b(significant|correlation|analysis|variables)\b/gi
    ];
    
    let academicMatches = 0;
    academicPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) academicMatches += matches.length;
    });
    
    if (academicMatches >= 2) {
      indicators.push('academic_style');
    }

    // Check for lack of personal voice
    const personalPronouns = text.match(/\b(I|me|my|we|us|our|you|your)\b/gi);
    const conversationalMarkers = text.match(/\b(well|you know|actually|honestly|frankly|hey)\b/gi);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    if ((!personalPronouns || personalPronouns.length < 2) && 
        (!conversationalMarkers || conversationalMarkers.length === 0) &&
        sentences.length > 2) {
      indicators.push('lack_personal_voice');
    }

    // Check for other AI characteristics
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    
    if (avgLength > 20) {
      indicators.push('long_sentences');
    }

    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    if (lexicalDiversity < 0.4) {
      indicators.push('low_lexical_diversity');
    }

    // Check for formal vocabulary
    const formalWords = ['utilize', 'facilitate', 'implement', 'demonstrate', 'comprehensive', 'systematic', 'methodology', 'optimization', 'enhancement', 'establishment'];
    const formalCount = formalWords.reduce((count, word) => {
      return count + (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    if (formalCount > words.length * 0.02) {
      indicators.push('formal_vocabulary');
    }

    // Check for repetitive transitions
    const transitionWords = ['furthermore', 'moreover', 'additionally', 'consequently', 'therefore', 'however', 'meanwhile'];
    let transitionCount = 0;
    transitionWords.forEach(transition => {
      const matches = text.toLowerCase().match(new RegExp(`\\b${transition}\\b`, 'g'));
      if (matches) transitionCount += matches.length;
    });
    
    if (transitionCount >= 3) {
      indicators.push('repetitive_transitions');
    }

    // Check for uniform sentence structure
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    if (variance < 5 && sentences.length > 2) {
      indicators.push('uniform_structure');
    }

    return indicators;
  }

  private findPlagiarismIndicators(text: string): string[] {
    const indicators: string[] = [];

    // Check for formatting inconsistencies
    if (/\s{3,}/.test(text)) {
      indicators.push('Unusual spacing patterns detected');
    }

    if (/[.]{2,}|[!]{2,}|[?]{2,}/.test(text)) {
      indicators.push('Inconsistent punctuation patterns');
    }

    // Check for academic clichés
    const cliches = text.toLowerCase().match(/(since the dawn of time|throughout history|in today's society)/g);
    if (cliches) {
      indicators.push(`Academic clichés detected: ${cliches.length}`);
    }

    // Check for citation-like patterns without proper citations
    const citationPatterns = /\(.*\d{4}.*\)|according to|research shows|studies indicate/gi;
    const matches = text.match(citationPatterns);
    if (matches && matches.length > 2) {
      indicators.push('Multiple citation-like phrases without proper references');
    }

    return indicators;
  }

  private generateRecommendations(aiScore: number, plagiarismRisk: number, qualityMetrics: any): string[] {
    const recommendations: string[] = [];

    if (aiScore > 60) {
      recommendations.push('Consider varying sentence structure and length');
      recommendations.push('Replace formal academic language with more natural expressions');
      recommendations.push('Reduce excessive use of formal transition words');
      recommendations.push('Add personal insights and unique perspectives');
    }

    if (plagiarismRisk > 50) {
      recommendations.push('Ensure all sources are properly cited');
      recommendations.push('Paraphrase content more thoroughly');
      recommendations.push('Add original analysis and commentary');
    }

    if (qualityMetrics.lexicalDiversity < 40) {
      recommendations.push('Expand vocabulary and avoid word repetition');
    }

    if (qualityMetrics.sentenceVariation < 30) {
      recommendations.push('Vary sentence length and structure for better flow');
    }

    if (qualityMetrics.coherenceScore < 40) {
      recommendations.push('Add more transition words and connecting phrases');
    }

    if (recommendations.length === 0) {
      recommendations.push('Text shows good originality and human-like characteristics');
    }

    return recommendations;
  }

  private countSyllables(text: string): number {
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiouy]+/g, 'a')
      .replace(/a$/, '')
      .length || 1;
  }
}

export const detectionService = new TextDetectionService();