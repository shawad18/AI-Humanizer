// Multi-Model AI Service with GPT, Claude, and Custom Models
import { HumanizationSettings } from '../types/humanization';
import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'custom' | 'local';
  type: 'humanization' | 'detection' | 'writing_assistance' | 'translation';
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
  description: string;
}

export interface BatchProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  documents: string[];
  settings: HumanizationSettings;
  progress: number;
  results: any[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface AIWritingAssistance {
  suggestions: {
    type: 'grammar' | 'style' | 'clarity' | 'tone' | 'structure';
    text: string;
    replacement: string;
    confidence: number;
    explanation: string;
  }[];
  improvements: {
    readabilityScore: number;
    sentenceVariety: number;
    vocabularyRichness: number;
    toneConsistency: number;
  };
}

class MultiModelAIService {
  private availableModels: Map<string, AIModel> = new Map();
  private batchJobs: Map<string, BatchProcessingJob> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    const models: AIModel[] = [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        type: 'humanization',
        capabilities: ['humanization', 'detection', 'writing_assistance'],
        maxTokens: 128000,
        costPerToken: 0.00001,
        isAvailable: true,
        description: 'Most advanced OpenAI model for text humanization'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        type: 'humanization',
        capabilities: ['humanization', 'detection'],
        maxTokens: 16384,
        costPerToken: 0.000002,
        isAvailable: true,
        description: 'Fast and cost-effective OpenAI model'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        type: 'humanization',
        capabilities: ['humanization', 'writing_assistance', 'analysis'],
        maxTokens: 200000,
        costPerToken: 0.000015,
        isAvailable: true,
        description: 'Anthropic\'s most capable model for nuanced writing'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        type: 'humanization',
        capabilities: ['humanization', 'detection'],
        maxTokens: 200000,
        costPerToken: 0.000003,
        isAvailable: true,
        description: 'Balanced performance and cost from Anthropic'
      },
      {
        id: 'custom-humanizer-v1',
        name: 'Custom Humanizer v1',
        provider: 'custom',
        type: 'humanization',
        capabilities: ['humanization', 'detection'],
        maxTokens: 8192,
        costPerToken: 0.000001,
        isAvailable: true,
        description: 'Our proprietary fine-tuned model for humanization'
      }
    ];

    models.forEach(model => {
      this.availableModels.set(model.id, model);
    });
  }

  public async getAvailableModels(): Promise<AIModel[]> {
    try {
      const response = await apiClient.get<AIModel[]>(ENDPOINTS.AI.MODELS);
      return response.data as AIModel[];
    } catch (error) {
      console.error('Failed to fetch models from API, using local cache:', error);
      return Array.from(this.availableModels.values());
    }
  }

  public async humanizeWithModel(
    text: string, 
    modelId: string, 
    settings: HumanizationSettings
  ): Promise<any> {
    const model = this.availableModels.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    if (!model.isAvailable) {
      throw new Error(`Model ${modelId} is currently unavailable`);
    }

    try {
      const response = await apiClient.post(ENDPOINTS.AI.HUMANIZE, {
        text,
        modelId,
        settings,
        options: {
          includeAnalysis: true,
          returnAlternatives: true
        }
      });

      return {
        ...(response.data as any),
        modelUsed: model,
        cost: this.calculateCost(text, model)
      };
    } catch (error) {
      console.error(`Error humanizing with model ${modelId}:`, error);
      throw error;
    }
  }

  public async compareModels(
    text: string, 
    modelIds: string[], 
    settings: HumanizationSettings
  ): Promise<any[]> {
    const promises = modelIds.map(modelId => 
      this.humanizeWithModel(text, modelId, settings)
        .catch(error => ({ error: error.message, modelId }))
    );

    const results = await Promise.all(promises);
    
    return results.map((result, index) => ({
      modelId: modelIds[index],
      model: this.availableModels.get(modelIds[index]),
      result: result.error ? null : result,
      error: result.error || null
    }));
  }

  public async startBatchProcessing(
    documents: string[], 
    settings: HumanizationSettings,
    modelId: string = 'gpt-3.5-turbo'
  ): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchProcessingJob = {
      id: jobId,
      status: 'pending',
      documents,
      settings,
      progress: 0,
      results: [],
      createdAt: new Date().toISOString()
    };

    this.batchJobs.set(jobId, job);

    try {
      await apiClient.post(ENDPOINTS.AI.BATCH_PROCESS, {
        jobId,
        documents,
        settings,
        modelId
      });

      job.status = 'processing';
      return jobId;
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  public async getBatchJobStatus(jobId: string): Promise<BatchProcessingJob | null> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.AI.BATCH_PROCESS}/${jobId}`);
      const job = response.data as BatchProcessingJob;
      this.batchJobs.set(jobId, job);
      return job;
    } catch (error) {
      return this.batchJobs.get(jobId) || null;
    }
  }

  public async getWritingAssistance(
    text: string, 
    modelId: string = 'claude-3-opus'
  ): Promise<AIWritingAssistance> {
    try {
      const response = await apiClient.post('/ai/writing-assistance', {
        text,
        modelId,
        analysisTypes: ['grammar', 'style', 'clarity', 'tone', 'structure']
      });

      return response.data as any;
    } catch (error) {
      console.error('Error getting writing assistance:', error);
      throw error;
    }
  }

  public async detectAIWithMultipleModels(text: string): Promise<any> {
    try {
      const response = await apiClient.post(ENDPOINTS.AI.DETECT, {
        text,
        providers: ['openai', 'anthropic', 'custom'],
        detailed: true,
        consensus: true
      });

      return response.data as any;
    } catch (error) {
      console.error('Error detecting AI with multiple models:', error);
      throw error;
    }
  }

  public async trainCustomModel(
    trainingData: any[], 
    modelName: string,
    baseModel: string = 'gpt-3.5-turbo'
  ): Promise<string> {
    try {
      const response = await apiClient.post('/ai/train-model', {
        trainingData,
        modelName,
        baseModel,
        hyperparameters: {
          learningRate: 0.0001,
          batchSize: 32,
          epochs: 3
        }
      });

      return (response.data as { trainingJobId: string }).trainingJobId;
    } catch (error) {
      console.error('Error starting model training:', error);
      throw error;
    }
  }

  public async getUsageStatistics(): Promise<any> {
    try {
      const response = await apiClient.get(ENDPOINTS.AI.USAGE);
      return response.data as any;
    } catch (error) {
      console.error('Error fetching usage statistics:', error);
      throw error;
    }
  }

  private calculateCost(text: string, model: AIModel): number {
    // Rough token estimation (1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(text.length / 4);
    return estimatedTokens * model.costPerToken;
  }

  public getModelRecommendation(
    textLength: number, 
    priority: 'speed' | 'quality' | 'cost'
  ): string {
    switch (priority) {
      case 'speed':
        return textLength > 10000 ? 'gpt-3.5-turbo' : 'custom-humanizer-v1';
      case 'quality':
        return textLength > 50000 ? 'claude-3-opus' : 'gpt-4-turbo';
      case 'cost':
        return 'custom-humanizer-v1';
      default:
        return 'gpt-3.5-turbo';
    }
  }

  public async optimizeSettings(
    sampleText: string, 
    targetMetrics: any
  ): Promise<HumanizationSettings> {
    try {
      const response = await apiClient.post('/ai/optimize-settings', {
        sampleText,
        targetMetrics,
        iterations: 10
      });

      return (response.data as { optimizedSettings: any }).optimizedSettings;
    } catch (error) {
      console.error('Error optimizing settings:', error);
      throw error;
    }
  }
}

export const multiModelAIService = new MultiModelAIService();
export default multiModelAIService;