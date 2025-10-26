import { AdvancedHumanizationEngine } from '../humanizationEngine';
import { detectionService } from '../detectionService';
import { HumanizationSettings } from '../../types/humanization';

// Mock performance.now for consistent timing in tests
let mockTime = 0;
const mockPerformanceNow = jest.fn(() => {
  mockTime += 10;
  return mockTime;
});

global.performance = {
  ...global.performance,
  now: mockPerformanceNow,
} as Performance;

describe('Integration: humanize → analyze pipeline', () => {
  const engine = new AdvancedHumanizationEngine();

  const strongHumanSettings: HumanizationSettings = {
    formalityLevel: 3,
    creativityLevel: 8,
    vocabularyComplexity: 6,
    sentenceComplexity: 6,
    tone: 'casual',
    audience: 'general',
    targetAudience: 'general',
    writingStyle: 'narrative',
    aiDetectionAvoidance: 9,
    linguisticFingerprinting: 9,
    personalityStrength: 8,
    subjectArea: 'general',
    preserveStructure: true,
    addTransitions: true,
    varyingSentenceLength: true,
  };

  it('produces humanized text that analyzes to ~0% AI work', async () => {
    const humanLikeText = [
      "Honestly, I’ve been tinkering with this little side project for weeks now—",
      "you know, the kind that eats your evenings. Some days I write a ton; ",
      "others, I refactor, scribble notes, and just rant in my journal. It’s messy, ",
      "but it’s mine. I switch between short beats—bam!—and long rambles that wander ",
      "through ideas. Don’t get me wrong: I keep an eye on performance, but I let ",
      "myself try weird stuff first. When something breaks (and it does), I shrug, ",
      "breathe, and fix it, maybe grab coffee, then try again. If that sounds ",
      "familiar, great; if not, no worries—everyone’s rhythm is different."
    ].join(' ');

    const humanized = await engine.humanizeText(humanLikeText, strongHumanSettings);
    expect(humanized.text).toBeTruthy();

    const analyzed = await detectionService.analyzeText(humanized.text);

    // Expect strong human signature tripwire to kick in (near-zero score)
    expect(analyzed.aiDetectionScore).toBeLessThanOrEqual(5);
    expect(analyzed.riskLevel).toBe('low');
  });
});