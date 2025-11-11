const { retryWithBackoff, isRetryableError, generateIdempotencyKey } = require('../utils/retry');

describe('Retry Utilities', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3, 100);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');
      
      const result = await retryWithBackoff(fn, 3, 10);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));
      
      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should respect shouldRetry function', async () => {
      const nonRetryableError = new Error('non-retryable');
      nonRetryableError.response = { status: 400 };
      
      const fn = jest.fn().mockRejectedValue(nonRetryableError);
      
      await expect(
        retryWithBackoff(fn, 3, 10, () => false)
      ).rejects.toThrow('non-retryable');
      
      expect(fn).toHaveBeenCalledTimes(1); // Should not retry
    });
  });

  describe('isRetryableError', () => {
    it('should retry on network errors', () => {
      const error = new Error('ECONNRESET');
      error.code = 'ECONNRESET';
      
      expect(isRetryableError(error)).toBe(true);
    });

    it('should retry on 5xx errors', () => {
      const error = new Error('Server error');
      error.response = { status: 500 };
      
      expect(isRetryableError(error)).toBe(true);
    });

    it('should retry on 429 (rate limit)', () => {
      const error = new Error('Rate limited');
      error.response = { status: 429 };
      
      expect(isRetryableError(error)).toBe(true);
    });

    it('should not retry on 4xx errors (except 429, 408)', () => {
      const error = new Error('Bad request');
      error.response = { status: 400 };
      
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate a unique key', () => {
      const key1 = generateIdempotencyKey('platform', 'user', 'content');
      const key2 = generateIdempotencyKey('platform', 'user', 'content');
      
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      // Keys should be different due to timestamp
      expect(key1).not.toBe(key2);
    });

    it('should include platform and user in key', () => {
      const key = generateIdempotencyKey('instagram', 'user123', 'test content');
      
      expect(key).toContain('instagram');
      expect(key).toContain('user123');
    });
  });
});

