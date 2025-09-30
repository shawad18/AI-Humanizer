import { AdvancedHumanizationEngine } from '../humanizationEngine';
import { HumanizationSettings } from '../../types/humanization';

describe('Debug HumanizationEngine', () => {
  let humanizationEngine: AdvancedHumanizationEngine;
  
  const defaultSettings: HumanizationSettings = {
    formalityLevel: 5,
    creativityLevel: 5,
    vocabularyComplexity: 5,
    sentenceComplexity: 5,
    tone: 'neutral',
    targetAudience: 'general',
    audience: 'general',
    writingStyle: 'descriptive',
    subjectArea: 'general',
    aiDetectionAvoidance: 5,
    linguisticFingerprinting: 3,
    personalityStrength: 3,
    preserveStructure: true,
    addTransitions: true,
    varyingSentenceLength: true
  };

  beforeEach(() => {
    humanizationEngine = new AdvancedHumanizationEngine();
  });

  it('should debug processingTime calculation', async () => {
    const text = 'This is a test for measuring processing time.';
    
    console.log('Starting test...');
    const startTime = performance.now();
    console.log('Start time:', startTime);
    
    const result = await humanizationEngine.humanizeText(text, defaultSettings);
    
    const endTime = performance.now();
    console.log('End time:', endTime);
    console.log('Manual calculation:', endTime - startTime);
    console.log('Result processingTime:', result.processingTime);
    console.log('Result confidence:', result.confidence);
    console.log('Result text:', result.text);
    console.log('Result detectionRisk:', result.detectionRisk);
    
    expect(typeof result.processingTime).toBe('number');
    expect(result.processingTime).not.toBeNaN();
  });
});