export interface HumanizationSettings {
  tone: 'formal' | 'academic' | 'casual' | 'technical' | 'creative' | 'professional' | 'neutral' | 'conversational';
  formalityLevel: number;
  subjectArea: string;
  preserveStructure: boolean;
  addTransitions: boolean;
  varyingSentenceLength: boolean;
  creativityLevel: number;
  vocabularyComplexity: number;
  sentenceComplexity: number;
  personalityStrength: number;
  targetAudience: 'general' | 'academic' | 'professional' | 'student' | 'expert';
  writingStyle: 'descriptive' | 'analytical' | 'persuasive' | 'narrative' | 'expository' | 'academic' | 'technical' | 'creative';
  aiDetectionAvoidance: number;
  linguisticFingerprinting: number;
  audience: 'general' | 'academic' | 'professional' | 'student' | 'experts';
}

export interface HumanizationResult {
  text: string;
  confidence: number;
  detectionRisk: 'low' | 'medium' | 'high';
  appliedTechniques: string[];
  processingTime?: number;
}