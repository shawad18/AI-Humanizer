export interface DetectionResult {
  provider: string;
  score: number; // 0-100, where 100 is definitely AI-generated
  confidence: number; // 0-100, confidence in the result
  details: {
    sentences: SentenceAnalysis[];
    overallAssessment: string;
    recommendations: string[];
  };
  processingTime: number;
  error?: string;
}

export interface SentenceAnalysis {
  text: string;
  aiProbability: number;
  reasons: string[];
  startIndex: number;
  endIndex: number;
}

export interface CombinedDetectionResult {
  averageScore: number;
  confidence: number;
  consensus: 'human' | 'ai' | 'mixed' | 'uncertain';
  results: DetectionResult[];
  summary: {
    totalProviders: number;
    successfulProviders: number;
    processingTime: number;
    recommendations: string[];
  };
}

class AdvancedDetectionService {
  private apiKeys: { [provider: string]: string } = {};
  private enabledProviders: string[] = ['gptZero', 'originality', 'copyleaks', 'winston'];

  constructor() {
    // In a real implementation, these would be loaded from environment variables or user settings
    this.apiKeys = {
      gptZero: process.env.REACT_APP_GPTZERO_API_KEY || '',
      originality: process.env.REACT_APP_ORIGINALITY_API_KEY || '',
      copyleaks: process.env.REACT_APP_COPYLEAKS_API_KEY || '',
      winston: process.env.REACT_APP_WINSTON_API_KEY || ''
    };
  }

  async detectWithMultipleProviders(text: string): Promise<CombinedDetectionResult> {
    const startTime = Date.now();
    const promises = this.enabledProviders.map(provider => 
      this.detectWithProvider(text, provider).catch(error => ({
        provider,
        score: 0,
        confidence: 0,
        details: {
          sentences: [],
          overallAssessment: 'Error occurred during detection',
          recommendations: []
        },
        processingTime: 0,
        error: error.message
      }))
    );

    const results = await Promise.all(promises);
    const successfulResults = results.filter(result => !result.error);
    
    const averageScore = successfulResults.length > 0 
      ? successfulResults.reduce((sum, result) => sum + result.score, 0) / successfulResults.length
      : 0;

    const confidence = successfulResults.length > 0
      ? successfulResults.reduce((sum, result) => sum + result.confidence, 0) / successfulResults.length
      : 0;

    const consensus = this.determineConsensus(successfulResults);
    const recommendations = this.generateRecommendations(successfulResults, averageScore);

    return {
      averageScore,
      confidence,
      consensus,
      results,
      summary: {
        totalProviders: this.enabledProviders.length,
        successfulProviders: successfulResults.length,
        processingTime: Date.now() - startTime,
        recommendations
      }
    };
  }

  private async detectWithProvider(text: string, provider: string): Promise<DetectionResult> {
    const startTime = Date.now();

    switch (provider) {
      case 'gptZero':
        return this.detectWithGPTZero(text, startTime);
      case 'originality':
        return this.detectWithOriginality(text, startTime);
      case 'copyleaks':
        return this.detectWithCopyleaks(text, startTime);
      case 'winston':
        return this.detectWithWinston(text, startTime);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async detectWithGPTZero(text: string, startTime: number): Promise<DetectionResult> {
    // Simulate GPTZero API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const sentences = this.analyzeSentences(text);
    const score = Math.random() * 100;
    const confidence = 75 + Math.random() * 20;

    return {
      provider: 'GPTZero',
      score,
      confidence,
      details: {
        sentences,
        overallAssessment: score > 70 ? 'Likely AI-generated' : score > 30 ? 'Mixed content' : 'Likely human-written',
        recommendations: [
          'Consider rephrasing highlighted sentences',
          'Add more personal anecdotes',
          'Vary sentence structure'
        ]
      },
      processingTime: Date.now() - startTime
    };
  }

  private async detectWithOriginality(text: string, startTime: number): Promise<DetectionResult> {
    // Simulate Originality.ai API call
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

    const sentences = this.analyzeSentences(text);
    const score = Math.random() * 100;
    const confidence = 80 + Math.random() * 15;

    return {
      provider: 'Originality.ai',
      score,
      confidence,
      details: {
        sentences,
        overallAssessment: score > 75 ? 'High AI probability' : score > 40 ? 'Moderate AI probability' : 'Low AI probability',
        recommendations: [
          'Increase vocabulary diversity',
          'Add more complex sentence structures',
          'Include domain-specific terminology'
        ]
      },
      processingTime: Date.now() - startTime
    };
  }

  private async detectWithCopyleaks(text: string, startTime: number): Promise<DetectionResult> {
    // Simulate Copyleaks API call
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 600));

    const sentences = this.analyzeSentences(text);
    const score = Math.random() * 100;
    const confidence = 70 + Math.random() * 25;

    return {
      provider: 'Copyleaks',
      score,
      confidence,
      details: {
        sentences,
        overallAssessment: score > 80 ? 'Very likely AI-generated' : score > 50 ? 'Possibly AI-generated' : 'Likely human-written',
        recommendations: [
          'Add more emotional language',
          'Include personal experiences',
          'Use more colloquial expressions'
        ]
      },
      processingTime: Date.now() - startTime
    };
  }

  private async detectWithWinston(text: string, startTime: number): Promise<DetectionResult> {
    // Simulate Winston AI API call
    await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 700));

    const sentences = this.analyzeSentences(text);
    const score = Math.random() * 100;
    const confidence = 85 + Math.random() * 10;

    return {
      provider: 'Winston AI',
      score,
      confidence,
      details: {
        sentences,
        overallAssessment: score > 85 ? 'Definitely AI-generated' : score > 60 ? 'Likely AI-generated' : 'Likely human-written',
        recommendations: [
          'Reduce repetitive patterns',
          'Add more nuanced arguments',
          'Include contradictions and uncertainties'
        ]
      },
      processingTime: Date.now() - startTime
    };
  }

  private analyzeSentences(text: string): SentenceAnalysis[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return sentences.map((sentence, index) => {
      const aiProbability = Math.random() * 100;
      const reasons = [];

      if (aiProbability > 70) {
        reasons.push('Repetitive sentence structure');
        reasons.push('Formal tone throughout');
      } else if (aiProbability > 40) {
        reasons.push('Some unusual word choices');
      } else {
        reasons.push('Natural language patterns');
        reasons.push('Varied sentence structure');
      }

      return {
        text: sentence.trim(),
        aiProbability,
        reasons,
        startIndex: text.indexOf(sentence),
        endIndex: text.indexOf(sentence) + sentence.length
      };
    });
  }

  private determineConsensus(results: DetectionResult[]): 'human' | 'ai' | 'mixed' | 'uncertain' {
    if (results.length === 0) return 'uncertain';

    const aiCount = results.filter(r => r.score > 60).length;
    const humanCount = results.filter(r => r.score < 40).length;
    const mixedCount = results.length - aiCount - humanCount;

    if (aiCount > humanCount && aiCount > mixedCount) return 'ai';
    if (humanCount > aiCount && humanCount > mixedCount) return 'human';
    if (mixedCount > 0) return 'mixed';
    return 'uncertain';
  }

  private generateRecommendations(results: DetectionResult[], averageScore: number): string[] {
    const recommendations = new Set<string>();

    if (averageScore > 70) {
      recommendations.add('Consider significant rewriting to reduce AI detection');
      recommendations.add('Add more personal voice and experiences');
      recommendations.add('Vary sentence length and structure');
    } else if (averageScore > 40) {
      recommendations.add('Minor adjustments may help reduce AI detection');
      recommendations.add('Review highlighted sentences for improvement');
    } else {
      recommendations.add('Content appears naturally written');
      recommendations.add('Maintain current writing style');
    }

    // Add provider-specific recommendations
    results.forEach(result => {
      result.details.recommendations.forEach(rec => recommendations.add(rec));
    });

    return Array.from(recommendations);
  }

  setEnabledProviders(providers: string[]) {
    this.enabledProviders = providers.filter(p => 
      ['gptZero', 'originality', 'copyleaks', 'winston'].includes(p)
    );
  }

  setApiKey(provider: string, apiKey: string) {
    this.apiKeys[provider] = apiKey;
  }

  getAvailableProviders(): string[] {
    return ['gptZero', 'originality', 'copyleaks', 'winston'];
  }
}

export const advancedDetectionService = new AdvancedDetectionService();