import { HumanizationSettings } from '../../types/humanization';

describe('Types Test', () => {
  it('should create HumanizationSettings object', () => {
    const settings: HumanizationSettings = {
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

    expect(settings).toBeDefined();
    expect(settings.tone).toBe('neutral');
  });
});