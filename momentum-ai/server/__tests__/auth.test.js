const request = require('supertest');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.AI_PROVIDER = 'ollama';
process.env.OLLAMA_URL = 'http://localhost:11434';
process.env.AI_DEFAULT_MODEL = 'llama2';

// Mock Firebase Admin
const mockVerifyIdToken = jest.fn();
jest.mock('../firebaseAdmin', () => {
  return {
    auth: jest.fn(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
    apps: [{ name: 'test-app' }],
  };
});

// Mock AI service
jest.mock('../services/aiService', () => {
  return {
    provider: 'ollama',
    defaultModel: 'llama2',
    getAvailableModels: jest.fn(() => ['llama2', 'mistral']),
    generateContent: jest.fn(async () => 'Generated content'),
    constructor: {
      getProviderModelMap: jest.fn(() => ({
        ollama: {
          models: ['llama2', 'mistral'],
          default: 'llama2',
          supportsStreaming: true,
          supportsImageAnalysis: false,
        },
      })),
    },
  };
});

// Mock idempotency store
jest.mock('../services/idempotencyStore', () => {
  const store = new Map();
  return {
    isProcessed: jest.fn(async (eventId) => store.has(eventId)),
    markProcessed: jest.fn(async (eventId, eventType) => {
      store.set(eventId, { processed: true, timestamp: Date.now(), eventType });
    }),
    close: jest.fn(async () => {}),
  };
});

describe('AI Routes Authentication', () => {
  let app;

  beforeAll(() => {
    app = require('../server');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ai/generate', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/ai/generate')
        .send({ prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when invalid token is provided', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', 'Bearer invalid-token')
        .send({ prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when token is expired', async () => {
      const expiredError = new Error('Token expired');
      expiredError.code = 'auth/id-token-expired';
      mockVerifyIdToken.mockRejectedValue(expiredError);

      const response = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', 'Bearer expired-token')
        .send({ prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow access with valid token', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', 'Bearer valid-token')
        .send({ prompt: 'Test prompt' });
      
      // Should not return 401 (may return 200 or other status depending on AI service)
      expect(response.status).not.toBe(401);
    });
  });

  describe('POST /api/ai/generate-structured', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/ai/generate-structured')
        .send({ prompt: 'Test prompt', schema: {} });
      
      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/ai/generate-structured')
        .set('Authorization', 'Bearer invalid-token')
        .send({ prompt: 'Test prompt', schema: {} });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/ai/stream', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/ai/stream')
        .send({ prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/ai/stream')
        .set('Authorization', 'Bearer invalid-token')
        .send({ prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/ai/analyze-image', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/ai/analyze-image')
        .send({ imageData: 'data:image/jpeg;base64,test', prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/ai/analyze-image')
        .set('Authorization', 'Bearer invalid-token')
        .send({ imageData: 'data:image/jpeg;base64,test', prompt: 'Test prompt' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/ai/models (public endpoint)', () => {
    it('should allow access without token', async () => {
      const response = await request(app).get('/api/ai/models');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('models');
      expect(response.body).toHaveProperty('provider');
    });
  });
});

