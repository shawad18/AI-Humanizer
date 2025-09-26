import { HumanizationSettings } from '../App';

export interface HumanizationResult {
  text: string;
  confidence: number;
  detectionRisk: 'low' | 'medium' | 'high';
  appliedTechniques: string[];
}

export class AdvancedHumanizationEngine {
  private synonymDatabase: Map<string, string[]> = new Map();
  private transitionPhrases: Map<string, string[]> = new Map();
  private sentenceStarters: string[] = [];
  private academicPhrases: string[] = [];

  constructor() {
    this.initializeDatabases();
  }

  private initializeDatabases(): void {
    // Synonym database for common AI-generated words
    this.synonymDatabase.set('furthermore', ['additionally', 'moreover', 'in addition', 'besides', 'what is more']);
    this.synonymDatabase.set('however', ['nevertheless', 'nonetheless', 'on the other hand', 'conversely', 'yet']);
    this.synonymDatabase.set('therefore', ['consequently', 'thus', 'hence', 'as a result', 'accordingly']);
    this.synonymDatabase.set('important', ['significant', 'crucial', 'vital', 'essential', 'key', 'critical']);
    this.synonymDatabase.set('shows', ['demonstrates', 'illustrates', 'reveals', 'indicates', 'suggests', 'exhibits']);
    this.synonymDatabase.set('analyze', ['examine', 'investigate', 'study', 'explore', 'assess', 'evaluate']);
    this.synonymDatabase.set('understand', ['comprehend', 'grasp', 'perceive', 'recognize', 'appreciate']);
    this.synonymDatabase.set('develop', ['create', 'establish', 'formulate', 'construct', 'build', 'design']);
    this.synonymDatabase.set('significant', ['substantial', 'considerable', 'notable', 'meaningful', 'important']);
    this.synonymDatabase.set('various', ['numerous', 'multiple', 'diverse', 'different', 'several']);

    // Transition phrases by category
    this.transitionPhrases.set('contrast', [
      'In contrast to this perspective',
      'From a different angle',
      'Taking an alternative view',
      'On the flip side',
      'Conversely speaking'
    ]);
    
    this.transitionPhrases.set('addition', [
      'Building on this foundation',
      'Expanding upon this concept',
      'In a similar vein',
      'Along these lines',
      'Complementing this idea'
    ]);

    this.transitionPhrases.set('conclusion', [
      'Drawing these threads together',
      'Synthesizing these insights',
      'Bringing this analysis to a close',
      'In wrapping up these considerations',
      'To consolidate these findings'
    ]);

    // Sentence starters to avoid repetitive patterns
    this.sentenceStarters = [
      'Interestingly,',
      'Notably,',
      'Remarkably,',
      'Surprisingly,',
      'Curiously,',
      'Intriguingly,',
      'Fascinatingly,',
      'Strikingly,',
      'Unexpectedly,',
      'Particularly,'
    ];

    // Academic hedging phrases
    this.academicPhrases = [
      'appears to suggest',
      'seems to indicate',
      'tends to demonstrate',
      'may potentially',
      'could arguably',
      'might reasonably',
      'appears to be',
      'seems likely to',
      'tends to support'
    ];
  }

  public async humanizeText(text: string, settings: HumanizationSettings): Promise<HumanizationResult> {
    const appliedTechniques: string[] = [];
    let humanizedText = text;
    let confidence = 0;

    // Step 1: Sentence structure variation
    if (settings.varyingSentenceLength) {
      humanizedText = this.varySentenceStructure(humanizedText, settings.formalityLevel, settings.sentenceComplexity);
      appliedTechniques.push('Sentence Structure Variation');
      confidence += 15;
    }

    // Step 2: Synonym replacement with context awareness
    humanizedText = this.intelligentSynonymReplacement(humanizedText, settings.tone, settings.vocabularyComplexity);
    appliedTechniques.push('Contextual Synonym Replacement');
    confidence += 20;

    // Step 3: Transition enhancement
    if (settings.addTransitions) {
      humanizedText = this.enhanceTransitions(humanizedText);
      appliedTechniques.push('Advanced Transition Integration');
      confidence += 15;
    }

    // Step 4: Formality adjustment with nuanced language
    humanizedText = this.adjustFormalityLevel(humanizedText, settings.formalityLevel, settings.tone);
    appliedTechniques.push('Formality Calibration');
    confidence += 10;

    // Step 5: AI pattern disruption
    humanizedText = this.disruptAIPatterns(humanizedText, settings.aiDetectionAvoidance);
    appliedTechniques.push('AI Pattern Disruption');
    confidence += 20;

    // Step 6: Natural flow enhancement
    humanizedText = this.enhanceNaturalFlow(humanizedText);
    appliedTechniques.push('Natural Flow Enhancement');
    confidence += 10;

    // Step 7: Subject-specific terminology
    if (settings.subjectArea !== 'general') {
      humanizedText = this.applySubjectSpecificLanguage(humanizedText, settings.subjectArea);
      appliedTechniques.push('Subject-Specific Language');
      confidence += 10;
    }

    // Step 8: Creativity enhancements
    humanizedText = this.applyCreativityEnhancements(humanizedText, settings.creativityLevel);
    appliedTechniques.push('Creativity Enhancement');
    confidence += 10;

    // Step 9: Audience adaptation
    humanizedText = this.adjustForAudience(humanizedText, settings.targetAudience);
    appliedTechniques.push('Audience Adaptation');
    confidence += 5;

    // Step 10: Writing style application
    humanizedText = this.applyWritingStyle(humanizedText, settings.writingStyle);
    appliedTechniques.push('Writing Style Application');
    confidence += 5;

    // Step 11: Personality injection
    humanizedText = this.addPersonality(humanizedText, settings.personalityStrength, settings.tone);
    appliedTechniques.push('Personality Injection');
    confidence += 5;

    // Calculate detection risk
    const detectionRisk = this.calculateDetectionRisk(humanizedText, text);

    return {
      text: humanizedText,
      confidence: Math.min(confidence, 100),
      detectionRisk,
      appliedTechniques
    };
  }

  private varySentenceStructure(text: string, formalityLevel: number, complexityLevel: number = 5): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    return sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return '';

      // Apply complexity-based transformations
      if (complexityLevel > 7) {
        // High complexity: add subordinate clauses
        if (Math.random() > 0.6) {
          const complexConnectors = ['although', 'whereas', 'given that', 'considering that'];
          const connector = complexConnectors[Math.floor(Math.random() * complexConnectors.length)];
          return `${trimmed}, ${connector} this approach demonstrates.`;
        }
      } else if (complexityLevel < 4) {
        // Low complexity: simplify structure
        const simplified = trimmed.replace(/,\s*which\s+/g, '. This ').replace(/;\s*/g, '. ');
        return simplified + '.';
      }

      // Vary sentence beginnings based on formality
      if (formalityLevel > 7) {
        // Formal variations
        if (Math.random() > 0.7) {
          const formalStarters = ['Furthermore,', 'Moreover,', 'Additionally,', 'Consequently,'];
          return formalStarters[Math.floor(Math.random() * formalStarters.length)] + ' ' + trimmed.charAt(0).toLowerCase() + trimmed.slice(1) + '.';
        }
      } else if (formalityLevel < 4) {
        // Casual variations
        if (Math.random() > 0.6) {
          const casualStarters = ['So,', 'Well,', 'Actually,', 'Basically,'];
          return casualStarters[Math.floor(Math.random() * casualStarters.length)] + ' ' + trimmed.charAt(0).toLowerCase() + trimmed.slice(1) + '.';
        }
      }

      // Vary sentence beginnings
      if (index > 0 && Math.random() > 0.6) {
        // Add dependent clauses
        const dependentClauses = [
          'While this may seem straightforward,',
          'Although the evidence suggests,',
          'Despite initial appearances,',
          'Given these circumstances,',
          'Considering the broader context,',
          'In light of recent developments,'
        ];
        
        if (Math.random() > 0.7) {
          const clause = dependentClauses[Math.floor(Math.random() * dependentClauses.length)];
          return clause + ' ' + trimmed.charAt(0).toLowerCase() + trimmed.slice(1) + '.';
        }
      }

      // Occasionally restructure with participial phrases
      if (Math.random() > 0.8 && trimmed.includes(' and ')) {
        const parts = trimmed.split(' and ');
        if (parts.length === 2) {
          return `${parts[1].trim()}, ${parts[0].trim()}.`;
        }
      }

      return trimmed + '.';
    }).join(' ');
  }

  private intelligentSynonymReplacement(text: string, tone: string, vocabularyComplexity: number): string {
    let result = text;
    
    // Replace common AI-generated phrases with more natural alternatives
    this.synonymDatabase.forEach((synonyms, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        // Don't replace every instance - maintain some original words
        if (Math.random() > 0.4) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          return match === match.toLowerCase() ? synonym : 
                 synonym.charAt(0).toUpperCase() + synonym.slice(1);
        }
        return match;
      });
    });

    return result;
  }

  private enhanceTransitions(text: string): string {
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (index === 0 || !paragraph.trim()) return paragraph;

      // Determine transition type based on content
      let transitionType = 'addition';
      if (paragraph.toLowerCase().includes('however') || paragraph.toLowerCase().includes('but')) {
        transitionType = 'contrast';
      } else if (index === paragraphs.length - 1) {
        transitionType = 'conclusion';
      }

      const transitions = this.transitionPhrases.get(transitionType) || [];
      if (transitions.length > 0 && Math.random() > 0.5) {
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        return transition + ', ' + paragraph.charAt(0).toLowerCase() + paragraph.slice(1);
      }

      return paragraph;
    }).join('\n\n');
  }

  private adjustFormalityLevel(text: string, level: number, tone: string): string {
    let adjusted = text;

    // Formality adjustments
    if (level > 6) {
      // High formality - expand contractions and use formal language
      adjusted = adjusted.replace(/can't/g, 'cannot');
      adjusted = adjusted.replace(/won't/g, 'will not');
      adjusted = adjusted.replace(/don't/g, 'do not');
      adjusted = adjusted.replace(/isn't/g, 'is not');
      adjusted = adjusted.replace(/aren't/g, 'are not');
      adjusted = adjusted.replace(/it's/g, 'it is');
      adjusted = adjusted.replace(/that's/g, 'that is');
    } else if (level < 4) {
      // Lower formality - add some contractions if missing
      adjusted = adjusted.replace(/\bdo not\b/g, "don't");
      adjusted = adjusted.replace(/\bcannot\b/g, "can't");
      adjusted = adjusted.replace(/\bit is\b/g, "it's");
    }

    // Tone-specific adjustments
    if (tone === 'academic') {
      // Add academic hedging
      adjusted = adjusted.replace(/\bis\b/g, () => {
        return Math.random() > 0.7 ? this.academicPhrases[Math.floor(Math.random() * this.academicPhrases.length)] : 'is';
      });
    } else if (tone === 'technical') {
      // Add technical precision
      adjusted = adjusted.replace(/\bshows\b/g, 'demonstrates');
      adjusted = adjusted.replace(/\bproves\b/g, 'establishes');
    }

    return adjusted;
  }

  private disruptAIPatterns(text: string, aiDetectionAvoidance: number): string {
    let result = text;

    // Break up repetitive sentence patterns
    const sentences = result.split(/[.!?]+/).filter(s => s.trim());
    const processedSentences = sentences.map((sentence, index) => {
      let processed = sentence.trim();

      // Avoid starting multiple sentences with "The"
      if (processed.startsWith('The ') && index > 0 && sentences[index - 1].trim().startsWith('The ')) {
        processed = processed.replace(/^The /, 'This ');
      }

      // Add natural interjections occasionally
      if (Math.random() > 0.9 && index > 0) {
        const interjections = ['Indeed,', 'Notably,', 'Interestingly,', 'Remarkably,'];
        const interjection = interjections[Math.floor(Math.random() * interjections.length)];
        processed = interjection + ' ' + processed.charAt(0).toLowerCase() + processed.slice(1);
      }

      return processed;
    });

    result = processedSentences.join('. ') + '.';

    // Remove excessive use of "that"
    result = result.replace(/\bthat\s+that\b/g, 'that');
    
    // Vary paragraph lengths to avoid uniformity
    const paragraphs = result.split('\n\n');
    if (paragraphs.length > 2) {
      // Occasionally combine short paragraphs
      for (let i = 0; i < paragraphs.length - 1; i++) {
        if (paragraphs[i].split('.').length <= 2 && Math.random() > 0.7) {
          paragraphs[i] = paragraphs[i] + ' ' + paragraphs[i + 1];
          paragraphs.splice(i + 1, 1);
        }
      }
    }

    return paragraphs.join('\n\n');
  }

  private applyCreativityEnhancements(text: string, creativityLevel: number): string {
    if (creativityLevel < 5) return text;
    
    let result = text;
    
    // Add creative metaphors and analogies
    if (creativityLevel > 7) {
      const metaphors = [
        'like pieces of a puzzle',
        'as threads in a tapestry',
        'resembling a symphony',
        'akin to a dance'
      ];
      
      result = result.replace(/\bconnected\b/g, () => {
        if (Math.random() > 0.8) {
          return 'woven together ' + metaphors[Math.floor(Math.random() * metaphors.length)];
        }
        return 'connected';
      });
    }
    
    return result;
  }

  private adjustForAudience(text: string, audience: string): string {
    let result = text;
    
    switch (audience) {
      case 'academic':
        result = result.replace(/\bI think\b/g, 'It can be argued that');
        result = result.replace(/\bobviously\b/g, 'evidently');
        break;
      case 'general':
        result = result.replace(/\butilize\b/g, 'use');
        result = result.replace(/\bfacilitate\b/g, 'help');
        break;
      case 'professional':
        result = result.replace(/\bhelp\b/g, 'facilitate');
        result = result.replace(/\buse\b/g, 'utilize');
        break;
    }
    
    return result;
  }

  private applyWritingStyle(text: string, style: string): string {
    let result = text;
    
    switch (style) {
      case 'narrative':
        result = result.replace(/^([A-Z])/gm, 'As we explore $1');
        break;
      case 'analytical':
        result = result.replace(/\bshows\b/g, 'demonstrates through analysis');
        break;
      case 'persuasive':
        result = result.replace(/\bmight\b/g, 'undoubtedly will');
        break;
    }
    
    return result;
  }

  private addPersonality(text: string, strength: number, tone: string): string {
    if (strength < 3) return text;
    
    let result = text;
    
    if (tone === 'enthusiastic' && strength > 6) {
      result = result.replace(/\binteresting\b/g, 'fascinating');
      result = result.replace(/\bgood\b/g, 'excellent');
    } else if (tone === 'cautious' && strength > 6) {
      result = result.replace(/\bis\b/g, 'appears to be');
      result = result.replace(/\bwill\b/g, 'may');
    }
    
    return result;
  }

  private enhanceNaturalFlow(text: string): string {
    let result = text;

    // Add natural connectors within sentences
    result = result.replace(/\. ([A-Z])/g, (match, letter) => {
      if (Math.random() > 0.8) {
        const connectors = [', and ', ', while ', ', as ', ', since '];
        const connector = connectors[Math.floor(Math.random() * connectors.length)];
        return connector + letter.toLowerCase();
      }
      return match;
    });

    // Add emphasis through strategic word placement
    result = result.replace(/\bvery\s+(\w+)/g, (match, word) => {
      const intensifiers = ['particularly', 'especially', 'remarkably', 'notably'];
      const intensifier = intensifiers[Math.floor(Math.random() * intensifiers.length)];
      return `${intensifier} ${word}`;
    });

    return result;
  }

  private applySubjectSpecificLanguage(text: string, subject: string): string {
    const subjectTerms: { [key: string]: { [key: string]: string } } = {
      science: {
        'shows': 'demonstrates',
        'proves': 'establishes',
        'finds': 'observes',
        'says': 'indicates'
      },
      business: {
        'important': 'strategic',
        'good': 'optimal',
        'bad': 'suboptimal',
        'shows': 'reflects'
      },
      literature: {
        'shows': 'reveals',
        'important': 'significant',
        'character': 'protagonist',
        'story': 'narrative'
      }
    };

    let result = text;
    const terms = subjectTerms[subject];
    
    if (terms) {
      Object.entries(terms).forEach(([original, replacement]) => {
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        result = result.replace(regex, replacement);
      });
    }

    return result;
  }

  private calculateDetectionRisk(humanizedText: string, originalText: string): 'low' | 'medium' | 'high' {
    const similarity = this.calculateSimilarity(originalText, humanizedText);
    const aiPatterns = this.detectAIPatterns(humanizedText);
    
    // Calculate base risk score
    let riskScore = 50;
    
    // Adjust based on text characteristics
    const sentences = humanizedText.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    // Very uniform sentence lengths increase risk
    if (avgSentenceLength > 80 && avgSentenceLength < 120) {
      riskScore += 15;
    }
    
    // Repetitive patterns increase risk
    const words = humanizedText.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    if (lexicalDiversity < 0.4) {
      riskScore += 20;
    }
    
    // Similarity and AI patterns impact
    riskScore += similarity * 30;
    riskScore += aiPatterns * 5;
    
    if (riskScore > 70) return 'high';
    if (riskScore > 40) return 'medium';
    return 'low';
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  private detectAIPatterns(text: string): number {
    let patterns = 0;
    
    // Check for repetitive sentence starters
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const starters = sentences.map(s => s.trim().split(' ')[0]);
    const starterCounts = starters.reduce((acc, starter) => {
      acc[starter] = (acc[starter] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    Object.values(starterCounts).forEach(count => {
      if (count > 3) patterns++;
    });

    // Check for excessive use of transition words
    const transitionWords = ['furthermore', 'moreover', 'additionally', 'however', 'therefore'];
    transitionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 2) patterns++;
    });

    return patterns;
  }
}

export const humanizationEngine = new AdvancedHumanizationEngine();