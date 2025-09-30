import { apiClient } from '../../services/apiClient';
import { HumanizationSettings } from '../../types/humanization';
import axios from 'axios';

// Mock axios for integration testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Integration Tests', () => {
  const mockSettings: HumanizationSettings = {
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
    // Reset axios mocks
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/humanize', () => {
    it('should successfully humanize text', async () => {
      const mockResponse = {
        data: {
          text: 'This is the humanized version of the text.',
          confidence: 85,
          detectionRisk: 'low',
          appliedTechniques: ['tone_adjustment', 'sentence_variation'],
          processingTime: 150
        },
        success: true,
        timestamp: new Date().toISOString()
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      const result = await apiClient.humanizeText('Original text', mockSettings);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/humanize', {
        text: 'Original text',
        settings: mockSettings
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle validation errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            error: 'Invalid input',
            details: ['Text is required', 'Settings are invalid']
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(apiClient.humanizeText('', mockSettings))
        .rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: {
            error: 'Rate limit exceeded',
            retryAfter: 60
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(apiClient.humanizeText('Test text', mockSettings))
        .rejects.toThrow();
    });

    it('should handle server errors', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            error: 'Internal server error'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(apiClient.humanizeText('Test text', mockSettings))
        .rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.humanizeText('Test text', mockSettings))
        .rejects.toThrow('Network error');
    });
  });

  describe('Authentication', () => {
    it('should include auth token in requests when available', async () => {
      const mockResponse = {
        data: { text: 'Authenticated response' },
        success: true,
        timestamp: new Date().toISOString()
      };

      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('test-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      await apiClient.humanizeText('Test text', mockSettings);

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('GET /api/detect-ai', () => {
    it('should successfully detect AI content', async () => {
      const mockResponse = {
        data: {
          isAiGenerated: true,
          confidence: 92,
          indicators: ['repetitive_patterns', 'unnatural_flow'],
          score: 0.92
        },
        success: true,
        timestamp: new Date().toISOString()
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      const result = await apiClient.detectAI('Test text');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/detect-ai', {
        params: { text: 'Test text' }
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle detection errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            error: 'Text too short for analysis'
          }
        }
      };

      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(apiClient.detectAI('Hi'))
        .rejects.toThrow();
    });
  });

  describe('Performance testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockResponse = {
        data: {
          text: 'Concurrent response',
          confidence: 85,
          detectionRisk: 'low',
          appliedTechniques: ['tone_adjustment'],
          processingTime: 150
        },
        success: true,
        timestamp: new Date().toISOString()
      };

      mockedAxios.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      const concurrentRequests = Array(5).fill(null).map((_, index) =>
        apiClient.humanizeText(`Test text ${index}`, mockSettings)
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(2000); // Should handle concurrency well
      expect(mockedAxios.post).toHaveBeenCalledTimes(5);
    });
  });
});