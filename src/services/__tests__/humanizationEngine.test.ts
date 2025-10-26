import { AdvancedHumanizationEngine } from '../humanizationEngine';
import { HumanizationSettings } from '../../types/humanization';

// Mock performance.now for consistent testing
let mockTime = 0;
const mockPerformanceNow = jest.fn(() => {
  mockTime += 10; // Increment by 10ms each call
  return mockTime;
});

// Ensure performance object exists and replace performance.now directly
global.performance = {
  ...global.performance,
  now: mockPerformanceNow
} as Performance;

describe('HumanizationEngine', () => {
  let humanizationEngine: AdvancedHumanizationEngine;

  const defaultSettings: HumanizationSettings = {
    formalityLevel: 5,
    creativityLevel: 5,
    vocabularyComplexity: 5,
    sentenceComplexity: 5,
    tone: 'neutral',
    audience: 'general',
    targetAudience: 'general',
    writingStyle: 'narrative',
    aiDetectionAvoidance: 5,
    linguisticFingerprinting: 5,
    personalityStrength: 5,
    subjectArea: 'general',
    preserveStructure: true,
    addTransitions: true,
    varyingSentenceLength: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0; // Reset mock time for each test
    mockPerformanceNow.mockClear();
    humanizationEngine = new AdvancedHumanizationEngine();
  });

  describe('humanizeText', () => {
    it('should return a valid humanization result', async () => {
      const text = 'This is a test sentence for humanization.';
      const result = await humanizationEngine.humanizeText(text, defaultSettings);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('detectionRisk');
      expect(result).toHaveProperty('appliedTechniques');
      expect(result).toHaveProperty('processingTime');

      expect(typeof result.text).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.detectionRisk).toBe('string');
      expect(Array.isArray(result.appliedTechniques)).toBe(true);
      expect(typeof result.processingTime).toBe('number');
    });

    it('should handle empty text input', async () => {
      const result = await humanizationEngine.humanizeText('', defaultSettings);
      expect(result.text).toBe('');
      expect(result.confidence).toBe(0);
      expect(result.detectionRisk).toBe('low');
    });

    it('should handle very short text input', async () => {
      const text = 'Hi.';
      const result = await humanizationEngine.humanizeText(text, defaultSettings);
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should apply different techniques based on settings', async () => {
      const text = 'The implementation of artificial intelligence has revolutionized many industries.';
      
      const casualSettings = { ...defaultSettings, tone: 'casual' as const, creativityLevel: 8 };
      const formalSettings = { ...defaultSettings, tone: 'professional' as const, formalityLevel: 8 };

      const casualResult = await humanizationEngine.humanizeText(text, casualSettings);
      const formalResult = await humanizationEngine.humanizeText(text, formalSettings);

      expect(casualResult.text).not.toBe(formalResult.text);
      expect(casualResult.appliedTechniques).toContain('Formality Calibration');
      expect(formalResult.appliedTechniques).toContain('Formality Calibration');
    });

    it('should vary sentence structure when enabled', async () => {
      const text = 'The system works well. The system is efficient. The system is reliable.';
      const settings = { ...defaultSettings, varyingSentenceLength: true };
      
      const result = await humanizationEngine.humanizeText(text, settings);
      
      expect(result.appliedTechniques).toContain('Sentence Structure Variation');
      expect(result.text).not.toBe(text);
    });

    it('should add transitions when enabled', async () => {
      const text = 'First point is important. Second point is also relevant. Third point concludes the argument.';
      const settings = { ...defaultSettings, addTransitions: true };
      
      const result = await humanizationEngine.humanizeText(text, settings);
      
      expect(result.appliedTechniques).toContain('Advanced Transition Integration');
    });

    it('should preserve structure when enabled', async () => {
      const text = 'Title\n\nParagraph one.\n\nParagraph two.';
      const settings = { ...defaultSettings, preserveStructure: true };
      
      const result = await humanizationEngine.humanizeText(text, settings);
      
      // Should maintain basic structure (line breaks)
      expect(result.text.split('\n').length).toBeGreaterThanOrEqual(text.split('\n').length - 1);
    });

    it('should handle high AI detection avoidance settings', async () => {
      const text = 'Furthermore, the implementation demonstrates significant improvements. Additionally, the results indicate optimal performance.';
      const settings = { ...defaultSettings, aiDetectionAvoidance: 9 };
      
      const result = await humanizationEngine.humanizeText(text, settings);
      
      expect(result.appliedTechniques).toContain('AI Pattern Disruption');
      expect(result.detectionRisk).toBe('low');
    });

    it('should apply linguistic fingerprinting', async () => {
      const text = 'The analysis reveals important insights about the data patterns.';
      const settings = { ...defaultSettings, aiDetectionAvoidance: 8 };
      
      const result = await humanizationEngine.humanizeText(text, settings);
      
      expect(result.appliedTechniques).toContain('Linguistic Fingerprinting');
    });

    it('should handle different writing styles', async () => {
      const text = 'The research methodology involved comprehensive data collection and analysis.';
      
      const narrativeSettings = { ...defaultSettings, writingStyle: 'narrative' as const };
      const technicalSettings = { ...defaultSettings, writingStyle: 'technical' as const };
      const creativeSettings = { ...defaultSettings, writingStyle: 'creative' as const };

      const narrativeResult = await humanizationEngine.humanizeText(text, narrativeSettings);
      const technicalResult = await humanizationEngine.humanizeText(text, technicalSettings);
      const creativeResult = await humanizationEngine.humanizeText(text, creativeSettings);

      expect(narrativeResult.text).not.toBe(technicalResult.text);
      expect(technicalResult.text).not.toBe(creativeResult.text);
    });

    it('should handle different target audiences', async () => {
      const text = 'Machine learning algorithms process data to identify patterns.';
      
      const generalSettings = { ...defaultSettings, targetAudience: 'general' as const };
      const expertSettings = { ...defaultSettings, targetAudience: 'expert' as const };

      const generalResult = await humanizationEngine.humanizeText(text, generalSettings);
      const expertResult = await humanizationEngine.humanizeText(text, expertSettings);

      expect(generalResult.text).not.toBe(expertResult.text);
    });

    it('should return appropriate confidence levels', async () => {
      const shortText = 'Hello.';
      const longText = 'This is a comprehensive analysis of the implementation methodology that demonstrates significant improvements in performance metrics and operational efficiency through the application of advanced algorithms and optimization techniques.';
      
      const shortResult = await humanizationEngine.humanizeText(shortText, defaultSettings);
      const longResult = await humanizationEngine.humanizeText(longText, defaultSettings);

      expect(shortResult.confidence).toBeLessThan(longResult.confidence);
      expect(longResult.confidence).toBeGreaterThan(70);
    });

    it('should measure processing time', async () => {
      const text = 'This is a test for measuring processing time.';
      
      const result = await humanizationEngine.humanizeText(text, defaultSettings);

      expect(result.processingTime).toBeGreaterThan(0);
      expect(typeof result.processingTime).toBe('number');
    });
  });

  describe('Caching functionality', () => {
    it('should cache results for identical inputs', async () => {
      const text = 'This text should be cached for faster subsequent processing.';
      
      const firstResult = await humanizationEngine.humanizeText(text, defaultSettings);
      const secondResult = await humanizationEngine.humanizeText(text, defaultSettings);

      expect(firstResult.text).toBe(secondResult.text);
      expect(secondResult.processingTime).toBeLessThan(firstResult.processingTime || 0);
    });

    it('should return different results for different settings', async () => {
      const text = 'This text will be processed with different settings.';
      const settings1 = { ...defaultSettings, creativityLevel: 3 };
      const settings2 = { ...defaultSettings, creativityLevel: 8 };
      
      const result1 = await humanizationEngine.humanizeText(text, settings1);
      const result2 = await humanizationEngine.humanizeText(text, settings2);

      expect(result1.text).not.toBe(result2.text);
    });
  });

  describe('Error handling', () => {
    it('should handle null or undefined input gracefully', async () => {
      const result1 = await humanizationEngine.humanizeText(null as any, defaultSettings);
      const result2 = await humanizationEngine.humanizeText(undefined as any, defaultSettings);

      expect(result1.text).toBe('');
      expect(result2.text).toBe('');
      expect(result1.confidence).toBe(0);
      expect(result2.confidence).toBe(0);
    });

    it('should handle invalid settings gracefully', async () => {
      const text = 'Test text for invalid settings.';
      const invalidSettings = { ...defaultSettings, formalityLevel: -1, creativityLevel: 15 };
      
      const result = await humanizationEngine.humanizeText(text, invalidSettings);
      
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
    });
  });

  describe('Performance requirements', () => {
    it('should process text within reasonable time limits', async () => {
      const longText = 'Lorem ipsum '.repeat(100) + 'dolor sit amet consectetur adipiscing elit.';
      const startTime = Date.now();
      
      await humanizationEngine.humanizeText(longText, defaultSettings);
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle batch processing efficiently', async () => {
      const texts = [
        'First test sentence for batch processing.',
        'Second test sentence for batch processing.',
        'Third test sentence for batch processing.'
      ];
      
      const startTime = Date.now();
      const promises = texts.map(text => humanizationEngine.humanizeText(text, defaultSettings));
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(3000); // Batch should be efficient
    });
  });

  describe('Detection risk assessment', () => {
    it('should return appropriate risk levels', async () => {
      const aiLikeText = 'Furthermore, the implementation demonstrates significant improvements. Additionally, the analysis reveals optimal performance metrics. Moreover, the results indicate enhanced operational efficiency.';
      const humanLikeText = 'I think this approach works pretty well. It seems to give good results, and honestly, it\'s much better than what we had before.';
      
      const aiResult = await humanizationEngine.humanizeText(aiLikeText, { ...defaultSettings, aiDetectionAvoidance: 9 });
      const humanResult = await humanizationEngine.humanizeText(humanLikeText, defaultSettings);

      expect(['low', 'medium', 'high']).toContain(aiResult.detectionRisk);
      expect(['low', 'medium', 'high']).toContain(humanResult.detectionRisk);
    });
  });

  describe('Punctuation moderation', () => {
    it('removes parentheses containing only commas or punctuation', async () => {
      const text = 'This looks strange (, ,) but should be cleaned ( - ). Right?';
      const result = await humanizationEngine.humanizeText(text, defaultSettings);
      expect(result.text).not.toMatch(/\(\s*(?:,\s*)+\)/);
      expect(result.text).not.toMatch(/\(\s*[,.!?;:\-]+\s*\)/);
    });
  });
});