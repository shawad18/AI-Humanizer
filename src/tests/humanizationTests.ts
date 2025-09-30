import { humanizationEngine } from '../services/humanizationEngine';
import { HumanizationSettings } from '../types/humanization';

// Test cases for validating humanization effectiveness
export const testCases = [
  {
    id: 'academic-essay',
    name: 'Academic Essay Sample',
    originalText: `Artificial intelligence has revolutionized numerous industries and continues to transform the way we approach complex problems. The implementation of machine learning algorithms has enabled unprecedented levels of automation and efficiency. Furthermore, the development of neural networks has facilitated advanced pattern recognition capabilities. Consequently, organizations across various sectors have adopted AI technologies to enhance their operational effectiveness. Additionally, the integration of AI systems has resulted in significant improvements in decision-making processes. Moreover, the continuous advancement of computational power has accelerated the evolution of AI applications.`,
    expectedImprovements: ['reduced repetitive patterns', 'varied sentence structure', 'human-like transitions', 'personal perspective']
  },
  {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    originalText: `The system architecture consists of multiple interconnected components that work together to provide comprehensive functionality. Each component is designed to handle specific tasks and communicate with other components through well-defined interfaces. The implementation follows industry best practices and ensures optimal performance. The configuration parameters can be adjusted to meet specific requirements. The monitoring system provides real-time insights into system performance and identifies potential issues before they impact operations.`,
    expectedImprovements: ['less formal tone', 'varied vocabulary', 'human-like explanations', 'reduced AI patterns']
  },
  {
    id: 'business-report',
    name: 'Business Report Sample',
    originalText: `The quarterly analysis reveals significant growth in key performance indicators. Revenue increased by 15% compared to the previous quarter, demonstrating strong market demand. Customer satisfaction scores improved substantially, indicating enhanced service quality. The implementation of new strategies has yielded positive results across all departments. Market expansion efforts have been successful, resulting in increased brand recognition. The company's financial position remains robust, with healthy cash flow and reduced operational costs.`,
    expectedImprovements: ['conversational tone', 'varied sentence beginnings', 'human perspective', 'natural flow']
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing Sample',
    originalText: `The sun slowly descended behind the mountains, casting long shadows across the valley. The gentle breeze carried the scent of wildflowers through the air. Birds chirped melodiously in the distance, creating a symphony of natural sounds. The peaceful atmosphere enveloped everything in tranquility. The beauty of the landscape was truly breathtaking, inspiring a sense of wonder and appreciation for nature's magnificence.`,
    expectedImprovements: ['personal voice', 'varied descriptions', 'human emotions', 'natural storytelling']
  }
];

// Test settings configurations
export const testSettings: HumanizationSettings[] = [
  {
    formalityLevel: 3,
    creativityLevel: 7,
    vocabularyComplexity: 5,
    sentenceComplexity: 5,
    tone: 'casual',
    audience: 'general',
    targetAudience: 'general',
    writingStyle: 'narrative',
    aiDetectionAvoidance: 6,
    linguisticFingerprinting: 5,
    personalityStrength: 6,
    subjectArea: 'general',
    preserveStructure: true,
    addTransitions: true,
    varyingSentenceLength: true
  },
  {
    formalityLevel: 6,
    creativityLevel: 4,
    vocabularyComplexity: 8,
    sentenceComplexity: 7,
    tone: 'professional',
    audience: 'experts',
    targetAudience: 'expert',
    writingStyle: 'technical',
    aiDetectionAvoidance: 9,
    linguisticFingerprinting: 8,
    personalityStrength: 3,
    subjectArea: 'technology',
    preserveStructure: true,
    addTransitions: false,
    varyingSentenceLength: true
  },
  {
    formalityLevel: 4,
    creativityLevel: 8,
    vocabularyComplexity: 6,
    sentenceComplexity: 6,
    tone: 'conversational',
    audience: 'general',
    targetAudience: 'general',
    writingStyle: 'creative',
    aiDetectionAvoidance: 7,
    linguisticFingerprinting: 9,
    personalityStrength: 8,
    subjectArea: 'general',
    preserveStructure: false,
    addTransitions: true,
    varyingSentenceLength: true
  }
];

// Test runner function
export async function runHumanizationTests() {
  const results = [];
  
  for (const testCase of testCases) {
    for (const settings of testSettings) {
      try {
        const result = await humanizationEngine.humanizeText(testCase.originalText, settings);
        
        const testResult = {
          testId: testCase.id,
          testName: testCase.name,
          settings: settings,
          original: testCase.originalText,
          humanized: result.text,
          confidence: result.confidence,
          detectionRisk: result.detectionRisk,
          appliedTechniques: result.appliedTechniques,
          improvements: analyzeImprovements(testCase.originalText, result.text, testCase.expectedImprovements),
          timestamp: new Date().toISOString()
        };
        
        results.push(testResult);
        
        console.log(`✅ Test completed: ${testCase.name} with ${settings.tone} tone`);
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Detection Risk: ${result.detectionRisk}`);
        console.log(`   Applied Techniques: ${result.appliedTechniques.join(', ')}`);
        console.log('---');
        
      } catch (error) {
        console.error(`❌ Test failed: ${testCase.name}`, error);
        results.push({
          testId: testCase.id,
          testName: testCase.name,
          settings: settings,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  return results;
}

// Function to analyze improvements made by humanization
function analyzeImprovements(original: string, humanized: string, expectedImprovements: string[]) {
  const improvements = [];
  
  // Check for sentence structure variation
  const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (hasVariedSentenceStructure(originalSentences, humanizedSentences)) {
    improvements.push('varied sentence structure');
  }
  
  // Check for reduced repetitive patterns
  if (hasReducedRepetition(original, humanized)) {
    improvements.push('reduced repetitive patterns');
  }
  
  // Check for human-like transitions
  if (hasHumanLikeTransitions(humanized)) {
    improvements.push('human-like transitions');
  }
  
  // Check for personal perspective
  if (hasPersonalPerspective(humanized)) {
    improvements.push('personal perspective');
  }
  
  // Check for conversational tone
  if (hasConversationalTone(humanized)) {
    improvements.push('conversational tone');
  }
  
  return improvements;
}

// Helper functions for improvement analysis
function hasVariedSentenceStructure(original: string[], humanized: string[]): boolean {
  const originalStarters = original.map(s => s.trim().split(' ')[0].toLowerCase());
  const humanizedStarters = humanized.map(s => s.trim().split(' ')[0].toLowerCase());
  
  const originalUnique = new Set(originalStarters).size;
  const humanizedUnique = new Set(humanizedStarters).size;
  
  return humanizedUnique > originalUnique;
}

function hasReducedRepetition(original: string, humanized: string): boolean {
  const originalWords = original.toLowerCase().split(/\s+/);
  const humanizedWords = humanized.toLowerCase().split(/\s+/);
  
  const originalRepeats = countRepeatedWords(originalWords);
  const humanizedRepeats = countRepeatedWords(humanizedWords);
  
  return humanizedRepeats < originalRepeats;
}

function hasHumanLikeTransitions(text: string): boolean {
  const humanTransitions = [
    'but', 'yet', 'still', 'though', 'even so', 'that said',
    'also', 'plus', 'on top of that', 'what\'s more',
    'so', 'that\'s why', 'as a result', 'because of this'
  ];
  
  return humanTransitions.some(transition => 
    text.toLowerCase().includes(transition.toLowerCase())
  );
}

function hasPersonalPerspective(text: string): boolean {
  const personalIndicators = [
    'i think', 'in my opinion', 'i believe', 'from my perspective',
    'as i see it', 'from my experience', 'it seems to me'
  ];
  
  return personalIndicators.some(indicator => 
    text.toLowerCase().includes(indicator.toLowerCase())
  );
}

function hasConversationalTone(text: string): boolean {
  const conversationalIndicators = [
    'you know', 'well', 'actually', 'basically', 'pretty much',
    'kind of', 'sort of', 'i mean', 'let\'s be honest'
  ];
  
  return conversationalIndicators.some(indicator => 
    text.toLowerCase().includes(indicator.toLowerCase())
  );
}

function countRepeatedWords(words: string[]): number {
  const wordCount = new Map();
  let repeats = 0;
  
  words.forEach(word => {
    if (word.length > 3) { // Only count significant words
      const count = wordCount.get(word) || 0;
      wordCount.set(word, count + 1);
      if (count > 0) repeats++;
    }
  });
  
  return repeats;
}

// Performance benchmarking
export async function benchmarkPerformance() {
  const sampleText = testCases[0].originalText;
  const settings = testSettings[0];
  const iterations = 10;
  
  console.log('🚀 Starting performance benchmark...');
  
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await humanizationEngine.humanizeText(sampleText, settings);
    const endTime = performance.now();
    times.push(endTime - startTime);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`📊 Performance Results (${iterations} iterations):`);
  console.log(`   Average: ${avgTime.toFixed(2)}ms`);
  console.log(`   Min: ${minTime.toFixed(2)}ms`);
  console.log(`   Max: ${maxTime.toFixed(2)}ms`);
  
  return { avgTime, minTime, maxTime, iterations };
}

// Export test runner for use in components
export default {
  runHumanizationTests,
  benchmarkPerformance,
  testCases,
  testSettings
};