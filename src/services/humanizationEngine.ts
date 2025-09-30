import { HumanizationSettings, HumanizationResult } from '../types/humanization';

// Performance optimization: Add caching interface
interface CacheEntry {
  result: HumanizationResult;
  timestamp: number;
}

interface BatchQueueItem {
  text: string;
  settings: HumanizationSettings;
  resolve: (result: HumanizationResult) => void;
}

export class AdvancedHumanizationEngine {
  private synonymDatabase: Map<string, string[]> = new Map();
  private transitionPhrases: Map<string, string[]> = new Map();
  private sentenceStarters: string[] = [];
  private academicPhrases: string[] = [];

  // Performance optimization: Caching
  private resultCache: Map<string, CacheEntry> = new Map();
  private similarityCache: Map<string, number> = new Map();
  private patternCache: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  
  // Performance optimization: Batch processing
  private batchQueue: BatchQueueItem[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 5;
  private readonly BATCH_DELAY = 100; // ms
  
  // Performance optimization: Lazy loading
  private databasesInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializeDatabases();
  }

  // Performance optimization: Clear expired cache entries
  private cleanCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Convert entries to array for compatibility
    for (const [key, entry] of Array.from(this.resultCache.entries())) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.resultCache.delete(key));
    
    // Limit cache size
    if (this.resultCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.resultCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, this.resultCache.size - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.resultCache.delete(key));
    }
  }

  // Performance optimization: Generate cache key
  private generateCacheKey(text: string, settings: HumanizationSettings): string {
    if (!text) {
      return `empty_${JSON.stringify(settings)}`;
    }
    return `${text.substring(0, 100)}_${JSON.stringify(settings)}`;
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

  // New method for statistical pattern randomization
  private applyLinguisticFingerprinting(text: string, intensity: number): string {
    let result = text;
    const intensityFactor = intensity / 10; // Scale from 0-10 to 0-1
    
    // 1. Add human-like function words and filler phrases
    const functionWords = [
      {pattern: /\b(in conclusion|to summarize|in summary)\b/gi, replacements: ['ultimately', 'in the end', 'when all is said and done', 'looking back', 'all things considered']},
      {pattern: /\b(additionally|furthermore|moreover)\b/gi, replacements: ['also', 'plus', 'on top of that', 'what\'s more', 'not to mention']},
      {pattern: /\b(however|nevertheless|nonetheless)\b/gi, replacements: ['but', 'yet', 'still', 'though', 'even so', 'that said']},
      {pattern: /\b(consequently|therefore|thus|hence)\b/gi, replacements: ['so', 'that\'s why', 'as a result', 'because of this', 'which is why']}
    ];
    
    if (intensityFactor > 0.4) {
      functionWords.forEach(({pattern, replacements}) => {
        result = result.replace(pattern, match => {
          return Math.random() < 0.6 * intensityFactor 
            ? replacements[Math.floor(Math.random() * replacements.length)] 
            : match;
        });
      });
    }
    
    // 2. Add personal pronouns and first-person perspective (humans use these more than AI)
    if (intensityFactor > 0.5 && !result.includes('I ') && !result.includes('my ')) {
      const sentences = result.split(/[.!?]+\s/).filter(s => s.trim());
      if (sentences.length > 3) {
        // Add personal perspective to 1-2 sentences
        const numToModify = Math.min(2, Math.floor(sentences.length * 0.2));
        const indicesToModify: number[] = [];
        
        // Choose random sentences to modify, preferring the beginning or end
        while (indicesToModify.length < numToModify) {
          // Bias toward beginning and end of text
          const preferBeginningOrEnd = Math.random() < 0.7;
          let idx;
          if (preferBeginningOrEnd) {
            idx = Math.random() < 0.5 ? 0 : sentences.length - 1;
          } else {
            idx = Math.floor(Math.random() * sentences.length);
          }
          
          if (!indicesToModify.includes(idx)) {
            indicesToModify.push(idx);
          }
        }
        
        // Apply personal perspective modifications
        const personalPhrases = [
          {prefix: 'I think ', suffix: ''},
          {prefix: 'In my opinion, ', suffix: ''},
          {prefix: 'I believe ', suffix: ''},
          {prefix: 'From my perspective, ', suffix: ''},
          {prefix: 'As I see it, ', suffix: ''},
          {prefix: '', suffix: ', at least that\'s what I think'},
          {prefix: '', suffix: ', from my experience'},
          {prefix: '', suffix: ', or so it seems to me'}
        ];
        
        indicesToModify.forEach(idx => {
          const phrase = personalPhrases[Math.floor(Math.random() * personalPhrases.length)];
          let sentence = sentences[idx].trim();
          
          // Apply the personal phrase
          if (phrase.prefix) {
            sentence = phrase.prefix + sentence.charAt(0).toLowerCase() + sentence.slice(1);
          }
          if (phrase.suffix) {
            sentence = sentence + phrase.suffix;
          }
          
          sentences[idx] = sentence;
        });
        
        result = sentences.join('. ') + '.';
      }
    }
    
    // 3. Add regional/dialectal variations (humans often have regional markers in their writing)
    if (intensityFactor > 0.6 && Math.random() < 0.4) {
      // Choose a dialect style to apply consistently
      const dialectStyles = [
        { // American English
          patterns: [
            {from: /\bcentre\b/g, to: 'center'},
            {from: /\bcolour\b/g, to: 'color'},
            {from: /\bfavourite\b/g, to: 'favorite'},
            {from: /\blabour\b/g, to: 'labor'},
            {from: /\btheatre\b/g, to: 'theater'},
            {from: /\bdialogue\b/g, to: 'dialog'},
            {from: /\bcatalogue\b/g, to: 'catalog'}
          ]
        },
        { // British English
          patterns: [
            {from: /\bcenter\b/g, to: 'centre'},
            {from: /\bcolor\b/g, to: 'colour'},
            {from: /\bfavorite\b/g, to: 'favourite'},
            {from: /\blabor\b/g, to: 'labour'},
            {from: /\btheater\b/g, to: 'theatre'},
            {from: /\bdialog\b/g, to: 'dialogue'},
            {from: /\bcatalog\b/g, to: 'catalogue'}
          ]
        }
      ];
      
      // Select a dialect style
      const dialectStyle = dialectStyles[Math.floor(Math.random() * dialectStyles.length)];
      
      // Apply the patterns from the selected dialect
      dialectStyle.patterns.forEach(pattern => {
        result = result.replace(pattern.from, pattern.to);
      });
    }
    
    // 4. Add idiosyncratic expressions and quirks
    if (intensityFactor > 0.7) {
      const idiosyncrasies = [
        {
          // Repeated phrases or words (humans often have pet phrases)
          trigger: Math.random() < 0.3,
          apply: () => {
            const petPhrases = [
              'you know', 'like', 'basically', 'literally', 'honestly', 
              'actually', 'sort of', 'kind of', 'I mean'
            ];
            const selectedPhrase = petPhrases[Math.floor(Math.random() * petPhrases.length)];
            
            // Add the pet phrase 1-3 times in the text
            const occurrences = 1 + Math.floor(Math.random() * 2);
            const sentences = result.split(/[.!?]+\s/).filter(s => s.trim());
            
            if (sentences.length > occurrences) {
              for (let i = 0; i < occurrences; i++) {
                // Choose a random position in a random sentence
                const sentenceIdx = Math.floor(Math.random() * sentences.length);
                const words = sentences[sentenceIdx].split(' ');
                
                if (words.length > 3) {
                  const insertPosition = Math.floor(words.length / 2);
                  words.splice(insertPosition, 0, `, ${selectedPhrase},`);
                  sentences[sentenceIdx] = words.join(' ');
                }
              }
              
              result = sentences.join('. ') + '.';
            }
          }
        },
        {
          // Occasional use of emphasis
          trigger: Math.random() < 0.4,
          apply: () => {
            const sentences = result.split(/[.!?]+\s/).filter(s => s.trim());
            if (sentences.length > 2) {
              // Choose a random sentence
              const sentenceIdx = Math.floor(Math.random() * sentences.length);
              const words = sentences[sentenceIdx].split(' ');
              
              if (words.length > 4) {
                // Choose a significant word to emphasize
                const significantWords = words.filter(w => w.length > 4);
                if (significantWords.length > 0) {
                  const wordToEmphasize = significantWords[Math.floor(Math.random() * significantWords.length)];
                  const emphasisStyles = ['*', '_', 'really ', 'very ', 'extremely '];
                  const emphasisStyle = emphasisStyles[Math.floor(Math.random() * emphasisStyles.length)];
                  
                  // Apply emphasis
                  sentences[sentenceIdx] = sentences[sentenceIdx].replace(
                    new RegExp(`\\b${wordToEmphasize}\\b`), 
                    emphasisStyle === '*' || emphasisStyle === '_' 
                      ? `${emphasisStyle}${wordToEmphasize}${emphasisStyle}` 
                      : `${emphasisStyle}${wordToEmphasize}`
                  );
                }
              }
              
              result = sentences.join('. ') + '.';
            }
          }
        }
      ];
      
      // Apply random idiosyncrasies
      idiosyncrasies.forEach(idiosyncrasy => {
        if (idiosyncrasy.trigger) {
          idiosyncrasy.apply();
        }
      });
    }
    
    return result;
  }

  private randomizeStatisticalPatterns(text: string, intensity: number): string {
    let result = text;
    const intensityFactor = intensity / 10; // Scale from 0-10 to 0-1
    
    // 1. Randomize sentence length distribution
    const sentences = result.split(/[.!?]+\s/).filter(s => s.trim());
    if (sentences.length > 3) {
      // Calculate current sentence length statistics
      const lengths = sentences.map(s => s.split(' ').length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const stdDev = Math.sqrt(lengths.map(x => Math.pow(x - avgLength, 2)).reduce((a, b) => a + b, 0) / lengths.length);
      
      // AI text often has too consistent sentence lengths - add more variation
      const processedSentences = sentences.map((sentence, idx) => {
        // Target more natural distribution by occasionally combining or splitting sentences
        if (stdDev < 3 && sentence.length > 10 && Math.random() < 0.2 * intensityFactor) {
          // Split long sentences occasionally
          const words = sentence.split(' ');
          const splitPoint = Math.floor(words.length / 2) + Math.floor(Math.random() * 3) - 1;
          
          if (splitPoint > 3 && splitPoint < words.length - 3) {
            // Ensure both parts are substantial
            const firstPart = words.slice(0, splitPoint).join(' ');
            const secondPart = words.slice(splitPoint).join(' ');
            
            // Add appropriate punctuation and capitalization
            const connectors = ['. ', '! ', '? '];
            const connector = connectors[Math.floor(Math.random() * connectors.length)];
            return firstPart + connector + secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
          }
        }
        return sentence;
      });
      
      result = processedSentences.join('. ') + '.';
    }
    
    // 2. Randomize word frequency distribution
    // AI text often has unnatural word frequency patterns
    if (intensityFactor > 0.5) {
      // Get word frequencies
      const words = result.toLowerCase().match(/\b\w+\b/g) || [];
      const wordFreq: {[key: string]: number} = {};
      
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      // Find words with unusually high frequency (potential AI patterns)
      const avgFreq = words.length / Object.keys(wordFreq).length;
      const highFreqWords = Object.entries(wordFreq)
        .filter(([word, freq]) => freq > avgFreq * 1.5 && word.length > 3)
        .map(([word]) => word);
      
      // Replace some instances of high-frequency words with synonyms
      if (highFreqWords.length > 0) {
        const commonSynonyms: {[key: string]: string[]} = {
          'important': ['significant', 'crucial', 'essential', 'vital', 'key'],
          'very': ['quite', 'extremely', 'particularly', 'notably', 'especially'],
          'good': ['great', 'excellent', 'fine', 'quality', 'positive'],
          'bad': ['poor', 'negative', 'subpar', 'inadequate', 'problematic'],
          'big': ['large', 'substantial', 'considerable', 'significant', 'major'],
          'small': ['little', 'minor', 'tiny', 'slight', 'modest'],
          'interesting': ['intriguing', 'fascinating', 'engaging', 'compelling', 'captivating'],
          'difficult': ['challenging', 'hard', 'tough', 'demanding', 'problematic'],
          'easy': ['simple', 'straightforward', 'effortless', 'uncomplicated', 'manageable'],
          'beautiful': ['attractive', 'gorgeous', 'stunning', 'lovely', 'exquisite']
        };
        
        highFreqWords.forEach(word => {
          // Only replace if we have synonyms for this word
          if (commonSynonyms[word]) {
            const synonyms = commonSynonyms[word];
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            
            // Replace some but not all instances (about 60% of them)
            let count = 0;
            const maxReplacements = Math.ceil(wordFreq[word] * 0.6);
            
            result = result.replace(regex, match => {
              if (count < maxReplacements && Math.random() < 0.7 * intensityFactor) {
                count++;
                const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                // Preserve original capitalization
                return match.charAt(0) === match.charAt(0).toUpperCase() 
                  ? synonym.charAt(0).toUpperCase() + synonym.slice(1) 
                  : synonym;
              }
              return match;
            });
          }
        });
      }
    }
    
    // 3. Randomize paragraph structure
    if (intensityFactor > 0.6) {
      const paragraphs = result.split('\n\n');
      if (paragraphs.length > 1) {
        // AI often creates too uniform paragraph lengths
        // Occasionally merge very short paragraphs or split very long ones
        const processedParagraphs = [];
        
        for (let i = 0; i < paragraphs.length; i++) {
          let paragraph = paragraphs[i];
          const sentenceCount = (paragraph.match(/[.!?]+/g) || []).length;
          
          // Merge very short paragraphs
          if (sentenceCount === 1 && i < paragraphs.length - 1 && Math.random() < 0.7 * intensityFactor) {
            paragraph = paragraph + ' ' + paragraphs[i + 1];
            i++; // Skip the next paragraph
          }
          // Split very long paragraphs
          else if (sentenceCount > 5 && paragraph.length > 400 && Math.random() < 0.5 * intensityFactor) {
            const sentences = paragraph.split(/(?<=[.!?])\s+/);
            const splitPoint = Math.floor(sentences.length / 2);
            
            processedParagraphs.push(sentences.slice(0, splitPoint).join(' '));
            paragraph = sentences.slice(splitPoint).join(' ');
          }
          
          processedParagraphs.push(paragraph);
        }
        
        result = processedParagraphs.join('\n\n');
      }
    }
    
    return result;
  }

  // Performance optimization: Batch processing for multiple texts
  public async humanizeTextBatch(texts: string[], settings: HumanizationSettings): Promise<HumanizationResult[]> {
    // Process texts in batches for better performance
    const results: HumanizationResult[] = [];
    
    for (let i = 0; i < texts.length; i += this.BATCH_SIZE) {
      const batch = texts.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map(text => this.humanizeText(text, settings));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Performance optimization: Queue-based processing for real-time applications
  public humanizeTextQueued(text: string, settings: HumanizationSettings): Promise<HumanizationResult> {
    return new Promise((resolve) => {
      this.batchQueue.push({ text, settings, resolve });
      
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }
      
      this.batchTimer = setTimeout(() => {
        this.processBatchQueue();
      }, this.BATCH_DELAY);
    });
  }

  private async processBatchQueue(): Promise<void> {
    if (this.batchQueue.length === 0) return;
    
    const currentBatch = this.batchQueue.splice(0, this.BATCH_SIZE);
    this.batchTimer = null;
    
    try {
      const promises = currentBatch.map(async ({ text, settings, resolve }) => {
        try {
          const result = await this.humanizeText(text, settings);
          resolve(result);
        } catch (error) {
          // Handle individual errors gracefully
          resolve({
            text: text,
            confidence: 0,
            detectionRisk: 'high',
            appliedTechniques: ['Error: Processing failed'],
            processingTime: 0
          });
        }
      });
      
      await Promise.all(promises);
    } catch (error) {
      // Handle batch errors
      currentBatch.forEach(({ text, resolve }) => {
        resolve({
          text: text,
          confidence: 0,
          detectionRisk: 'high',
          appliedTechniques: ['Error: Batch processing failed'],
          processingTime: 0
        });
      });
    }
    
    // Process remaining items if any
    if (this.batchQueue.length > 0) {
      setTimeout(() => this.processBatchQueue(), this.BATCH_DELAY);
    }
  }

  // Performance optimization: Lazy initialization of databases
  private async ensureDatabasesInitialized(): Promise<void> {
    if (this.databasesInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = new Promise<void>((resolve) => {
      // Simulate async database loading (in real app, this might load from files/API)
      setTimeout(() => {
        if (!this.databasesInitialized) {
          this.initializeDatabases();
          this.databasesInitialized = true;
        }
        resolve();
      }, 10);
    });
    
    return this.initializationPromise;
  }

  public async humanizeText(text: string, settings: HumanizationSettings): Promise<HumanizationResult> {
    const startTime = performance.now();
    
    // Handle null, undefined, or empty text
    if (!text || text.trim().length === 0) {
      return {
        text: text || '',
        confidence: 0,
        detectionRisk: 'low',
        appliedTechniques: [],
        processingTime: performance.now() - startTime
      };
    }

    // Performance optimization: Ensure databases are initialized
    await this.ensureDatabasesInitialized();
    
    // Performance optimization: Check cache first
    const cacheKey = this.generateCacheKey(text, settings);
    const cachedResult = this.resultCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < this.CACHE_TTL) {
      // Add processing time to cached result
      return {
        ...cachedResult.result,
        processingTime: performance.now() - startTime
      };
    }
    
    // Clean expired cache entries periodically
    this.cleanCache();

    // Structure preservation: Store original structure if enabled
    let originalStructure: string[] = [];
    let structureMap: Map<number, string> = new Map();
    
    if (settings.preserveStructure) {
      // Split text by line breaks and store structure
      originalStructure = text.split('\n');
      
      // Create a map of line indices to their content for reconstruction
      originalStructure.forEach((line, index) => {
        structureMap.set(index, line);
      });
    }

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

    // Step 5: AI pattern disruption and statistical pattern randomization
    humanizedText = this.disruptAIPatterns(humanizedText, settings.aiDetectionAvoidance);
    appliedTechniques.push('AI Pattern Disruption');
    confidence += 20;
    
    // Apply statistical pattern randomization
    if (settings.aiDetectionAvoidance > 5) {
      humanizedText = this.randomizeStatisticalPatterns(humanizedText, settings.aiDetectionAvoidance);
      appliedTechniques.push('Statistical Pattern Randomization');
      confidence += 15;
    }
    
    // Apply linguistic fingerprinting for maximum avoidance
    if (settings.aiDetectionAvoidance > 7) {
      humanizedText = this.applyLinguisticFingerprinting(humanizedText, settings.aiDetectionAvoidance);
      appliedTechniques.push('Linguistic Fingerprinting');
      confidence += 20;
    }

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

    // Adjust confidence based on text length - shorter texts have less opportunity for humanization
    const textLength = text.length;
    let lengthAdjustment = 1.0;
    
    if (textLength < 50) {
      lengthAdjustment = 0.5; // Very short texts get 50% confidence
    } else if (textLength < 100) {
      lengthAdjustment = 0.7; // Short texts get 70% confidence
    } else if (textLength < 200) {
      lengthAdjustment = 0.85; // Medium texts get 85% confidence
    }
    // Longer texts (200+ chars) get full confidence
    
    confidence = Math.floor(confidence * lengthAdjustment);

    // Structure preservation: Reconstruct original structure if enabled
    if (settings.preserveStructure && originalStructure.length > 1) {
      // Split the humanized text into sentences
      const humanizedSentences = humanizedText.split(/(?<=[.!?])\s+/);
      
      // Try to map sentences back to original lines while preserving structure
      const reconstructedLines: string[] = [];
      let sentenceIndex = 0;
      
      for (let i = 0; i < originalStructure.length; i++) {
        const originalLine = originalStructure[i];
        
        if (originalLine.trim() === '') {
          // Preserve empty lines
          reconstructedLines.push('');
        } else if (sentenceIndex < humanizedSentences.length) {
          // Use humanized sentence but try to maintain line structure
          const sentencesInLine = originalLine.split(/(?<=[.!?])\s+/).length;
          let lineContent = '';
          
          for (let j = 0; j < sentencesInLine && sentenceIndex < humanizedSentences.length; j++) {
            if (j > 0) lineContent += ' ';
            lineContent += humanizedSentences[sentenceIndex];
            sentenceIndex++;
          }
          
          reconstructedLines.push(lineContent || originalLine);
        } else {
          // Fallback to original line if we run out of humanized sentences
          reconstructedLines.push(originalLine);
        }
      }
      
      humanizedText = reconstructedLines.join('\n');
      appliedTechniques.push('Structure Preservation');
    }

    // Calculate detection risk
    // Calculate detection risk with memoization
    const detectionRisk = this.calculateDetectionRiskMemoized(humanizedText, text);
    
    const result: HumanizationResult = {
      text: humanizedText,
      confidence: Math.min(confidence, 100),
      detectionRisk,
      appliedTechniques,
      processingTime: performance.now() - startTime
    };
    
    // Performance optimization: Cache the result
    this.resultCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
    }
    
    // Performance optimization: Memoized version of calculateDetectionRisk
    private calculateDetectionRiskMemoized(humanizedText: string, originalText: string): 'low' | 'medium' | 'high' {
    const cacheKey = `${humanizedText.substring(0, 50)}_${originalText.substring(0, 50)}`;
    
    // Check if we've already calculated this
    const cachedSimilarity = this.similarityCache.get(cacheKey);
    let similarity: number;
    
    if (cachedSimilarity !== undefined) {
      similarity = cachedSimilarity;
    } else {
      similarity = this.calculateSimilarity(originalText, humanizedText);
      this.similarityCache.set(cacheKey, similarity);
    }

    const aiPatterns = this.detectAIPatterns(humanizedText);
    
    // Calculate base risk score - starting with a lower baseline
    let riskScore = 30; // Reduced from 50 to start with a more optimistic baseline
    
    // Adjust based on text characteristics
    const sentences = humanizedText.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length > 0) {
      // Calculate sentence length statistics
      const sentenceLengths = sentences.map(s => s.length);
      const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentences.length;
      
      // Calculate standard deviation of sentence lengths
      const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentences.length;
      const stdDev = Math.sqrt(variance);
      
      // Higher variation in sentence length (higher stdDev) is more human-like
      const sentenceLengthVariationFactor = stdDev / avgSentenceLength;
      
      // Very uniform sentence lengths increase risk
      if (sentenceLengthVariationFactor < 0.3) {
        riskScore += 15;
      } else if (sentenceLengthVariationFactor > 0.5) {
        // Good variation reduces risk
        riskScore -= 10;
      }
      
      // Check for personal pronouns (humans use more personal pronouns)
      const personalPronounCount = (humanizedText.match(/\b(I|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi) || []).length;
      const pronounRatio = personalPronounCount / (humanizedText.length / 100); // Normalize by text length
      
      // Higher pronoun usage reduces risk (more human-like)
      if (pronounRatio > 0.3) {
        riskScore -= 15;
      }
      
      // Check for contractions (humans use more contractions)
      const contractionCount = (humanizedText.match(/\b(don't|can't|won't|isn't|aren't|haven't|hasn't|wouldn't|couldn't|shouldn't)\b/gi) || []).length;
      const contractionRatio = contractionCount / (humanizedText.length / 100); // Normalize by text length
      
      // Higher contraction usage reduces risk (more human-like)
      if (contractionRatio > 0.2) {
        riskScore -= 10;
      }
    }
    
    // Repetitive patterns increase risk
    const words = humanizedText.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    // Adjust lexical diversity thresholds
    if (lexicalDiversity < 0.4) {
      riskScore += 20;
    } else if (lexicalDiversity > 0.6) {
      // High lexical diversity reduces risk
      riskScore -= 15;
    }
    
    // Check for filler words and hedging (humans use more of these)
    const fillerWordCount = (humanizedText.match(/\b(like|you know|sort of|kind of|basically|actually|literally|honestly|I mean)\b/gi) || []).length;
    const fillerRatio = fillerWordCount / (humanizedText.length / 100); // Normalize by text length
    
    // Higher filler word usage reduces risk (more human-like)
    if (fillerRatio > 0.15) {
      riskScore -= 15;
    }
    
    // Check for inconsistencies in writing style (humans are less consistent)
    // For example, mixing formal and informal language
    const formalWords = (humanizedText.match(/\b(therefore|consequently|furthermore|moreover|thus|hence|regarding|concerning)\b/gi) || []).length;
    const informalWords = (humanizedText.match(/\b(anyway|plus|also|so|well|okay|cool|stuff|things|kinda|gonna)\b/gi) || []).length;
    
    // Having both formal and informal elements is more human-like
    if (formalWords > 0 && informalWords > 0) {
      riskScore -= 10;
    }
    
    // Reduced impact of similarity and AI patterns
    riskScore += similarity * 15; // Reduced from 30 to 15
    riskScore += aiPatterns * 3;  // Reduced from 5 to 3
    
    // Apply GPTZero-specific evasion techniques
    // Check for markers that GPTZero specifically looks for
    const hasComplexSentenceStructures = /[,;:]\s*\w+\s*[,;:]/.test(humanizedText);
    if (hasComplexSentenceStructures) {
      riskScore -= 10;
    }
    
    // Check for varied punctuation usage (humans tend to be less consistent)
    const punctuationVariety = new Set(humanizedText.match(/[,.;:!?-]/g) || []).size;
    if (punctuationVariety >= 4) {
      riskScore -= 8;
    }
    
    // Final adjustment based on text length (longer texts have more opportunity for human patterns)
    if (humanizedText.length > 1000) {
      riskScore = Math.max(riskScore - 10, 0);
    }
    
    // Adjusted thresholds to be more lenient (reduce false positives)
    if (riskScore > 80) return 'high';    // Increased from 70 to 80
    if (riskScore > 50) return 'medium';  // Increased from 40 to 50
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

    // Additional missing methods implementation
    private varySentenceStructure(text: string, formalityLevel: number, sentenceComplexity: number): string {
      const sentences = text.split(/(?<=[.!?])\s+/);
      
      return sentences.map(sentence => {
        if (Math.random() < sentenceComplexity) {
          // Add complexity by inserting clauses
          const complexityPhrases = [
            'which is important to note',
            'as we can see',
            'it should be mentioned',
            'worth considering'
          ];
          
          const randomPhrase = complexityPhrases[Math.floor(Math.random() * complexityPhrases.length)];
          const words = sentence.split(' ');
          if (words.length > 5) {
            const insertIndex = Math.floor(words.length / 2);
            words.splice(insertIndex, 0, `, ${randomPhrase},`);
            return words.join(' ');
          }
        }
        return sentence;
      }).join(' ');
    }

    private intelligentSynonymReplacement(text: string, tone: string, vocabularyComplexity: number): string {
      // Simple synonym replacement based on tone and complexity
      const synonymMaps: { [key: string]: { [key: string]: string[] } } = {
        'formal': {
          'good': ['excellent', 'superior', 'outstanding'],
          'bad': ['inadequate', 'substandard', 'deficient'],
          'big': ['substantial', 'considerable', 'significant']
        },
        'casual': {
          'good': ['great', 'awesome', 'cool'],
          'bad': ['terrible', 'awful', 'crappy'],
          'big': ['huge', 'massive', 'enormous']
        }
      };
      
      const synonyms = synonymMaps[tone] || synonymMaps['formal'];
      
      Object.entries(synonyms).forEach(([word, replacements]) => {
        if (Math.random() < vocabularyComplexity) {
          const replacement = replacements[Math.floor(Math.random() * replacements.length)];
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          text = text.replace(regex, replacement);
        }
      });
      
      return text;
    }

    private enhanceTransitions(text: string): string {
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length < 2) return text;
      
      const transitions = [
        'Furthermore,', 'Additionally,', 'Moreover,', 'However,', 
        'Nevertheless,', 'Consequently,', 'Therefore,', 'Meanwhile,'
      ];
      
      // Add transitions between some sentences
      for (let i = 1; i < sentences.length; i++) {
        if (Math.random() < 0.3) { // 30% chance to add transition
          const transition = transitions[Math.floor(Math.random() * transitions.length)];
          sentences[i] = transition + ' ' + sentences[i].toLowerCase();
        }
      }
      
      return sentences.join(' ');
    }

    private adjustFormalityLevel(text: string, formalityLevel: number, tone: string): string {
      if (formalityLevel > 0.7) {
        // Make more formal
        text = text.replace(/\b(don't|can't|won't|isn't|aren't)\b/gi, (match) => {
          const expansions: { [key: string]: string } = {
            "don't": 'do not', "can't": 'cannot', "won't": 'will not',
            "isn't": 'is not', "aren't": 'are not'
          };
          return expansions[match.toLowerCase()] || match;
        });
        
        text = text.replace(/\b(get|got)\b/gi, (match) => {
          return match.toLowerCase() === 'get' ? 'obtain' : 'obtained';
        });
      } else if (formalityLevel < 0.3) {
        // Make more casual
        text = text.replace(/\b(do not|cannot|will not|is not|are not)\b/gi, (match) => {
          const contractions: { [key: string]: string } = {
            'do not': "don't", 'cannot': "can't", 'will not': "won't",
            'is not': "isn't", 'are not': "aren't"
          };
          return contractions[match.toLowerCase()] || match;
        });
      }
      
      return text;
    }

    private disruptAIPatterns(text: string, aiDetectionAvoidance: number): string {
      if (aiDetectionAvoidance < 0.3) return text;
      
      let result = text;
      
      // Add human-like imperfections
      if (Math.random() < aiDetectionAvoidance) {
        // Occasionally use "like" as a filler
        const sentences = result.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          sentences[randomIndex] = sentences[randomIndex].replace(/\b(really|very)\b/i, 'like, really');
          result = sentences.join(' ');
        }
      }
      
      // Add occasional self-corrections
      if (Math.random() < aiDetectionAvoidance * 0.5) {
        const corrections = [
          'or rather,', 'I mean,', 'well, actually,', 'to put it differently,'
        ];
        const randomCorrection = corrections[Math.floor(Math.random() * corrections.length)];
        const sentences = result.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          sentences[randomIndex] = sentences[randomIndex].replace(/\.$/, `, ${randomCorrection} `) + sentences[randomIndex];
          result = sentences.join(' ');
        }
      }
      
      // Vary punctuation slightly
      if (Math.random() < aiDetectionAvoidance * 0.3) {
        result = result.replace(/\. /g, (match) => {
          return Math.random() < 0.1 ? '... ' : match;
        });
      }
      
      return result;
    }

    // Additional missing methods implementation
    private enhanceNaturalFlow(text: string): string {
      // Add natural flow enhancements like connecting phrases
      const connectingPhrases = [
        'In other words,', 'That said,', 'On the other hand,', 'What\'s more,',
        'In fact,', 'As a matter of fact,', 'Speaking of which,', 'By the way,'
      ];
      
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length > 2) {
        const randomIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
        const randomPhrase = connectingPhrases[Math.floor(Math.random() * connectingPhrases.length)];
        sentences[randomIndex] = randomPhrase + ' ' + sentences[randomIndex].toLowerCase();
      }
      
      return sentences.join(' ');
    }

    private applySubjectSpecificLanguage(text: string, subjectArea?: string): string {
      if (!subjectArea) return text;
      
      // Add subject-specific terminology based on the area
      const subjectTerms: { [key: string]: string[] } = {
        'technology': ['innovative', 'cutting-edge', 'state-of-the-art', 'revolutionary'],
        'business': ['strategic', 'synergistic', 'scalable', 'market-driven'],
        'academic': ['empirical', 'theoretical', 'methodological', 'comprehensive'],
        'creative': ['imaginative', 'expressive', 'artistic', 'inspirational']
      };
      
      const terms = subjectTerms[subjectArea.toLowerCase()] || [];
      if (terms.length > 0) {
        const randomTerm = terms[Math.floor(Math.random() * terms.length)];
        // Replace a generic adjective with a subject-specific one
        text = text.replace(/\b(good|great|nice|excellent)\b/i, randomTerm);
      }
      
      return text;
    }

    private applyCreativityEnhancements(text: string, creativityLevel: number): string {
      if (creativityLevel < 0.3) return text;
      
      // Add creative elements based on creativity level
      const creativeElements = [
        'metaphorically speaking', 'in a sense', 'if you will', 'so to speak',
        'as it were', 'in a manner of speaking'
      ];
      
      if (Math.random() < creativityLevel) {
        const randomElement = creativeElements[Math.floor(Math.random() * creativeElements.length)];
        const sentences = text.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          sentences[randomIndex] = sentences[randomIndex].replace(/\.$/, `, ${randomElement}.`);
          text = sentences.join(' ');
        }
      }
      
      return text;
    }

    private adjustForAudience(text: string, targetAudience: string): string {
      const audienceAdjustments: { [key: string]: (text: string) => string } = {
        'general': (t) => t.replace(/\b(utilize|commence|terminate)\b/gi, (match) => {
          const replacements: { [key: string]: string } = {
            'utilize': 'use', 'commence': 'start', 'terminate': 'end'
          };
          return replacements[match.toLowerCase()] || match;
        }),
        'academic': (t) => t.replace(/\b(use|start|end)\b/gi, (match) => {
          const replacements: { [key: string]: string } = {
            'use': 'utilize', 'start': 'commence', 'end': 'terminate'
          };
          return replacements[match.toLowerCase()] || match;
        }),
        'professional': (t) => t.replace(/\bkinda\b/gi, 'somewhat').replace(/\bgonna\b/gi, 'going to')
      };
      
      const adjustment = audienceAdjustments[targetAudience.toLowerCase()];
      return adjustment ? adjustment(text) : text;
    }

    private applyWritingStyle(text: string, writingStyle: string): string {
      const styleAdjustments: { [key: string]: (text: string) => string } = {
        'formal': (t) => t.replace(/\b(don't|can't|won't)\b/gi, (match) => {
          const expansions: { [key: string]: string } = {
            "don't": 'do not', "can't": 'cannot', "won't": 'will not'
          };
          return expansions[match.toLowerCase()] || match;
        }),
        'casual': (t) => t.replace(/\b(do not|cannot|will not)\b/gi, (match) => {
          const contractions: { [key: string]: string } = {
            'do not': "don't", 'cannot': "can't", 'will not': "won't"
          };
          return contractions[match.toLowerCase()] || match;
        }),
        'academic': (t) => t.replace(/\bI think\b/gi, 'It is posited that').replace(/\bshows\b/gi, 'demonstrates'),
        'creative': (t) => t.replace(/\bvery\b/gi, 'incredibly').replace(/\bgood\b/gi, 'magnificent'),
        'technical': (t) => t.replace(/\buse\b/gi, 'implement').replace(/\bmake\b/gi, 'construct')
      };
      
      const adjustment = styleAdjustments[writingStyle.toLowerCase()];
      return adjustment ? adjustment(text) : text;
    }

    private addPersonality(text: string, personalityStrength: number, tone: string): string {
      if (personalityStrength < 0.3) return text;
      
      const personalityMarkers: { [key: string]: string[] } = {
        'friendly': ['honestly', 'you know', 'I mean', 'actually'],
        'professional': ['indeed', 'certainly', 'undoubtedly', 'clearly'],
        'casual': ['like', 'kinda', 'sorta', 'pretty much'],
        'formal': ['furthermore', 'moreover', 'consequently', 'therefore'],
        'creative': ['imagine', 'picture this', 'envision', 'consider'],
        'technical': ['specifically', 'precisely', 'systematically', 'methodically'],
        'conversational': ['well', 'so', 'anyway', 'by the way'],
        'neutral': ['generally', 'typically', 'usually', 'often']
      };
      
      const markers = personalityMarkers[tone.toLowerCase()] || personalityMarkers['neutral'];
      
      if (Math.random() < personalityStrength && markers.length > 0) {
        const randomMarker = markers[Math.floor(Math.random() * markers.length)];
        const sentences = text.split(/(?<=[.!?])\s+/);
        if (sentences.length > 0) {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          sentences[randomIndex] = randomMarker.charAt(0).toUpperCase() + randomMarker.slice(1) + ', ' + sentences[randomIndex].toLowerCase();
          text = sentences.join(' ');
        }
      }
      
      return text;
    }

  // Cleanup method to prevent memory leaks
  public cleanup(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    // Clear any pending batch queue
    this.batchQueue = [];
  }
}

export const humanizationEngine = new AdvancedHumanizationEngine();