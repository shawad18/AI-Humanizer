import { detectionService } from '../detectionService';

describe('DetectionService', () => {
  describe('analyzeText', () => {
    it('should return a valid detection result', async () => {
      const text = 'This is a sample text for AI detection analysis.';
      const result = await detectionService.analyzeText(text);

      expect(result).toHaveProperty('isAIGenerated');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('detectedPatterns');
      expect(result).toHaveProperty('suggestions');

      expect(typeof result.isAIGenerated).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(['low', 'medium', 'high']).toContain(result.riskLevel);
      expect(Array.isArray(result.detectedPatterns)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should detect AI-like patterns in formal text', async () => {
      const aiLikeText = `Furthermore, the implementation demonstrates significant improvements in operational efficiency. Additionally, the comprehensive analysis reveals optimal performance metrics across all evaluated parameters. Moreover, the systematic approach ensures consistent results and enhanced productivity. Consequently, the organization can achieve substantial benefits through strategic implementation of these methodologies.`;
      
      const result = await detectionService.analyzeText(aiLikeText);
      
      expect(result.confidence).toBeGreaterThan(60);
      expect(result.detectedPatterns.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
    });

    it('should recognize human-like text patterns', async () => {
      const humanLikeText = `You know what? I've been thinking about this whole situation, and honestly, it's pretty complicated. I mean, there are so many factors to consider, and frankly, I'm not sure there's a perfect solution. But hey, that's life, right? Sometimes you just have to make the best decision you can with the information you have.`;
      
      const result = await detectionService.analyzeText(humanLikeText);
      
      expect(result.confidence).toBeLessThan(40);
      expect(result.riskLevel).toBe('low');
    });

    it('should handle empty text input', async () => {
      const result = await detectionService.analyzeText('');
      
      expect(result.isAIGenerated).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.detectedPatterns).toEqual([]);
    });

    it('should handle very short text input', async () => {
      const result = await detectionService.analyzeText('Hello.');
      
      expect(result).toHaveProperty('isAIGenerated');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeLessThan(50); // Short text should have low confidence
    });

    it('should detect repetitive transition words', async () => {
      const repetitiveText = `Furthermore, this approach works well. Additionally, it provides good results. Moreover, the implementation is effective. Consequently, we achieve our goals.`;
      
      const result = await detectionService.analyzeText(repetitiveText);
      
      expect(result.detectedPatterns).toContain('repetitive_transitions');
      expect(result.confidence).toBeGreaterThan(70);
    });

    it('should detect uniform sentence structure', async () => {
      const uniformText = `The system processes data efficiently. The algorithm analyzes patterns accurately. The implementation delivers results consistently. The methodology ensures quality outcomes.`;
      
      const result = await detectionService.analyzeText(uniformText);
      
      expect(result.detectedPatterns).toContain('uniform_structure');
    });

    it('should detect formal vocabulary patterns', async () => {
      const formalText = `The comprehensive methodology facilitates optimal implementation of sophisticated algorithms to enhance operational efficiency and maximize organizational productivity through systematic utilization of advanced technological solutions.`;
      
      const result = await detectionService.analyzeText(formalText);
      
      expect(result.detectedPatterns).toContain('formal_vocabulary');
      expect(result.confidence).toBeGreaterThan(60);
    });

    it('should provide relevant suggestions for improvement', async () => {
      const aiLikeText = `Furthermore, the analysis demonstrates significant improvements. Additionally, the implementation ensures optimal performance. Moreover, the results indicate enhanced efficiency.`;
      
      const result = await detectionService.analyzeText(aiLikeText);
      
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('transition'))).toBe(true);
    });

    it('should handle null or undefined input gracefully', async () => {
      const result1 = await detectionService.analyzeText(null as any);
      const result2 = await detectionService.analyzeText(undefined as any);

      expect(result1.isAIGenerated).toBe(false);
      expect(result2.isAIGenerated).toBe(false);
      expect(result1.confidence).toBe(0);
      expect(result2.confidence).toBe(0);
    });
  });

  describe('Pattern detection algorithms', () => {
    it('should detect GPT-like patterns', async () => {
      const gptLikeText = `In conclusion, the comprehensive analysis of the implementation methodology reveals significant improvements in operational efficiency and performance metrics, demonstrating the effectiveness of the proposed solution.`;
      
      const result = await detectionService.analyzeText(gptLikeText);
      
      expect(result.detectedPatterns).toContain('gpt_patterns');
    });

    it('should detect academic writing patterns', async () => {
      const academicText = `This study examines the relationship between variables X and Y. The methodology employed a quantitative approach utilizing statistical analysis. The findings indicate a significant correlation between the examined factors.`;
      
      const result = await detectionService.analyzeText(academicText);
      
      expect(result.detectedPatterns).toContain('academic_style');
    });

    it('should detect lack of personal voice', async () => {
      const impersonalText = `The system operates according to predefined parameters. The algorithm processes input data systematically. The output generates based on computational analysis.`;
      
      const result = await detectionService.analyzeText(impersonalText);
      
      expect(result.detectedPatterns).toContain('lack_personal_voice');
    });

    it('should recognize conversational markers', async () => {
      const conversationalText = `Well, I think this is pretty interesting. You know, it reminds me of something I read last week. Actually, let me tell you what I think about this whole thing.`;
      
      const result = await detectionService.analyzeText(conversationalText);
      
      expect(result.confidence).toBeLessThan(30);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Confidence scoring', () => {
    it('should return higher confidence for clearly AI-generated text', async () => {
      const clearAIText = `Furthermore, the comprehensive implementation of advanced methodologies facilitates optimal operational efficiency. Additionally, the systematic approach ensures consistent performance metrics. Moreover, the strategic utilization of technological solutions maximizes organizational productivity.`;
      
      const result = await detectionService.analyzeText(clearAIText);
      
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.isAIGenerated).toBe(true);
    });

    it('should return lower confidence for ambiguous text', async () => {
      const ambiguousText = `The project went well. We completed most of the tasks on time. The team worked together effectively.`;
      
      const result = await detectionService.analyzeText(ambiguousText);
      
      expect(result.confidence).toBeLessThan(60);
    });

    it('should return very low confidence for clearly human text', async () => {
      const humanText = `OMG, you won't believe what happened today! So I was walking to the store, right? And this random dog just starts following me. I'm like, "What's up, buddy?" But then I realized it probably just wanted some food or something. Dogs are so cute, aren't they?`;
      
      const result = await detectionService.analyzeText(humanText);
      
      expect(result.confidence).toBeLessThan(20);
      expect(result.isAIGenerated).toBe(false);
    });
  });

  describe('Risk level assessment', () => {
    it('should assign high risk to AI-heavy text', async () => {
      const highRiskText = `Subsequently, the implementation demonstrates substantial improvements in operational metrics. Furthermore, the comprehensive analysis reveals optimal performance indicators. Additionally, the systematic methodology ensures consistent results across all evaluated parameters.`;
      
      const result = await detectionService.analyzeText(highRiskText);
      
      expect(result.riskLevel).toBe('high');
    });

    it('should assign medium risk to moderately AI-like text', async () => {
      const mediumRiskText = `The analysis shows good results. The implementation works effectively. However, there are some areas for improvement that should be considered.`;
      
      const result = await detectionService.analyzeText(mediumRiskText);
      
      expect(['medium', 'low']).toContain(result.riskLevel);
    });

    it('should assign low risk to human-like text', async () => {
      const lowRiskText = `I really enjoyed reading this book. It made me think about my own experiences and how I've grown over the years. Sometimes I wonder if other people have similar thoughts.`;
      
      const result = await detectionService.analyzeText(lowRiskText);
      
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Performance and reliability', () => {
    it('should process text within reasonable time', async () => {
      const longText = 'This is a test sentence. '.repeat(100);
      const startTime = Date.now();
      
      await detectionService.analyzeText(longText);
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should return consistent results for identical input', async () => {
      const text = 'This is a consistent test for detection analysis.';
      
      const result1 = await detectionService.analyzeText(text);
      const result2 = await detectionService.analyzeText(text);
      
      expect(result1.confidence).toBe(result2.confidence);
      expect(result1.riskLevel).toBe(result2.riskLevel);
      expect(result1.isAIGenerated).toBe(result2.isAIGenerated);
    });

    it('should handle special characters and formatting', async () => {
      const specialText = `Hello! @#$%^&*() This text contains special characters: "quotes", 'apostrophes', and numbers 123456. Does it still work? Yes, it should!`;
      
      const result = await detectionService.analyzeText(specialText);
      
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('riskLevel');
    });
  });

  describe('Zero score override', () => {
    it('returns 0 AI score for strong human signature', async () => {
      const text = [
        "Hey — so here’s the thing: I’m genuinely excited about this, but I also have a couple of nagging doubts; you know how it is.",
        "We tried a few approaches, and, honestly, some of them felt clunky — not wrong, just… too tidy.",
        "I keep asking myself: does it read like a real person? (Because if it doesn’t, I’d rather fix it than pretend.)",
        "Anyway, we’ll tweak bits here and there—add a dash of personality, a few contractions, and vary the rhythm. It’s better that way!",
        "You get the idea, right? Sometimes you just iterate, listen, adjust, repeat… and then smile when it finally clicks."
      ].join(' ');

      const result = await detectionService.analyzeText(text);
      expect(result.aiDetectionScore).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.isAIGenerated).toBe(false);
    });
  });
});