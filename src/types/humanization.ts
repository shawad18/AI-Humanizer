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
  // Output formatting options (optional)
  formattingMode?: 'preserve' | 'auto' | 'paragraphs' | 'markdown';
  maxParagraphSentences?: number; // default 3
  normalizeWhitespace?: boolean;  // default true
  listConversion?: 'none' | 'bullet' | 'markdown';
  maxLineLength?: number; // soft wrap hint, default undefined
}

export interface HumanizationResult {
  text: string;
  confidence: number;
  detectionRisk: 'low' | 'medium' | 'high';
  appliedTechniques: string[];
  processingTime?: number;
}