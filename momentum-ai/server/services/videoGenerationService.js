/**
 * Video Generation Service
 * Handles AI video generation using third-party providers (RunwayML, Pika, MiniMax)
 */

const logger = require('../utils/logger');
const axios = require('axios');
const admin = require('../firebaseAdmin');
const { v4: uuidv4 } = require('uuid');
const { validateUrl, sanitizeFilename } = require('../utils/security');

class VideoGenerationService {
  constructor() {
    this.provider = process.env.VIDEO_PROVIDER || 'runway';
    this.runwayKey = process.env.RUNWAY_API_KEY;
    this.pikaKey = process.env.PIKA_API_KEY;
    this.minimaxKey = process.env.MINIMAX_API_KEY;
    this.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    
    logger.info(`Video Generation Service initialized with provider: ${this.provider}`);
  }

  /**
   * Generate video from text prompt
   */
  async generateVideo(prompt, options = {}) {
    const {
      provider = this.provider,
      model = 'runway-gen2',
      resolution = '1080p',
      duration = 6,
      imagePreview = null,
      fps = 24
    } = options;

    // Validate prompt
    if (!prompt && !imagePreview) {
      throw new Error('Either prompt or imagePreview is required');
    }

    if (prompt && (typeof prompt !== 'string' || prompt.trim().length === 0)) {
      throw new Error('Prompt must be a non-empty string if provided');
    }

    // Validate image preview URL if provided
    if (imagePreview) {
      const urlValidation = await validateUrl(imagePreview, true);
      if (!urlValidation.valid) {
        throw new Error(`Invalid image preview URL: ${urlValidation.error}`);
      }
    }

    // Validate duration
    const validDuration = Math.min(Math.max(1, parseInt(duration) || 6), 60); // Limit to 1-60 seconds

    try {
      let jobId;
      let estimatedTime = 300; // 5 minutes default

      if (provider === 'runway') {
        jobId = await this.generateWithRunway(prompt, { model, resolution, duration: validDuration, imagePreview });
      } else if (provider === 'pika') {
        jobId = await this.generateWithPika(prompt, { resolution, duration: validDuration });
        estimatedTime = 180; // 3 minutes for Pika
      } else if (provider === 'minimax') {
        jobId = await this.generateWithMiniMax(prompt, { model, resolution, duration: validDuration });
        estimatedTime = 240; // 4 minutes for MiniMax
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        jobId,
        status: 'queued',
        estimatedTime,
        provider
      };
    } catch (error) {
      logger.error('Video generation error:', error);
      throw new Error(`Failed to start video generation: ${error.message}`);
    }
  }

  /**
   * Generate with RunwayML
   */
  async generateWithRunway(prompt, options = {}) {
    if (!this.runwayKey) {
      throw new Error('RunwayML API key not configured');
    }

    const { model = 'gen2', resolution = '1080p', duration = 6, imagePreview = null } = options;

    try {
      const payload = {
        text_prompt: prompt,
        ratio: this.getAspectRatio(resolution),
        duration: duration,
        watermark: false
      };

      if (imagePreview) {
        payload.image_url = imagePreview;
      }

      const response = await axios.post(
        'https://api.runwayml.com/v1/image-to-video',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.runwayKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.id;
    } catch (error) {
      logger.error('RunwayML generation error:', error);
      throw new Error(`RunwayML API error: ${error.message}`);
    }
  }

  /**
   * Generate with Pika Labs
   */
  async generateWithPika(prompt, options = {}) {
    if (!this.pikaKey) {
      throw new Error('Pika Labs API key not configured');
    }

    const { resolution = '1080p', duration = 6 } = options;

    try {
      const response = await axios.post(
        'https://api.pika.art/v1/generate',
        {
          prompt: prompt,
          aspect_ratio: this.getAspectRatio(resolution),
          duration: duration
        },
        {
          headers: {
            'Authorization': `Bearer ${this.pikaKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.job_id;
    } catch (error) {
      logger.error('Pika Labs generation error:', error);
      throw new Error(`Pika Labs API error: ${error.message}`);
    }
  }

  /**
   * Generate with MiniMax Hailuo
   */
  async generateWithMiniMax(prompt, options = {}) {
    if (!this.minimaxKey) {
      throw new Error('MiniMax API key not configured');
    }

    const { model = 'MiniMax-Hailuo-2.3', resolution = '1080p', duration = 6 } = options;

    try {
      const response = await axios.post(
        'https://api.minimax.chat/v1/text_to_video',
        {
          model: model,
          prompt: prompt,
          resolution: resolution,
          duration: duration
        },
        {
          headers: {
            'Authorization': `Bearer ${this.minimaxKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.task_id;
    } catch (error) {
      logger.error('MiniMax generation error:', error);
      throw new Error(`MiniMax API error: ${error.message}`);
    }
  }

  /**
   * Convert image to video
   */
  async imageToVideo(imageUrl, prompt, options = {}) {
    const {
      provider = this.provider,
      model = 'runway-gen2',
      resolution = '1080p',
      duration = 6,
      motionStrength = 0.5
    } = options;

    // Validate inputs
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Image URL is required');
    }

    // Validate image URL
    const urlValidation = validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      throw new Error(`Invalid image URL: ${urlValidation.error}`);
    }

    // Validate duration
    const validDuration = Math.min(Math.max(1, parseInt(duration) || 6), 60); // Limit to 1-60 seconds

    // Validate motion strength
    const validMotionStrength = Math.min(Math.max(0, parseFloat(motionStrength) || 0.5), 1); // Limit to 0-1

    try {
      let jobId;
      let estimatedTime = 300;

      if (provider === 'runway') {
        jobId = await this.generateWithRunway(prompt, {
          model,
          resolution,
          duration: validDuration,
          imagePreview: imageUrl
        });
      } else if (provider === 'pika') {
        jobId = await this.generateWithPika(prompt, { resolution, duration: validDuration });
        estimatedTime = 180;
      } else {
        jobId = await this.generateWithMiniMax(prompt, { model, resolution, duration: validDuration });
        estimatedTime = 240;
      }

      return {
        jobId,
        status: 'queued',
        estimatedTime,
        provider
      };
    } catch (error) {
      logger.error('Image-to-video error:', error);
      throw new Error(`Failed to start image-to-video conversion: ${error.message}`);
    }
  }

  /**
   * Get video generation status
   */
  async getVideoStatus(jobId, provider) {
    try {
      if (provider === 'runway') {
        return await this.getRunwayStatus(jobId);
      } else if (provider === 'pika') {
        return await this.getPikaStatus(jobId);
      } else if (provider === 'minimax') {
        return await this.getMiniMaxStatus(jobId);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      logger.error('Video status check error:', error);
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }

  /**
   * Get RunwayML status
   */
  async getRunwayStatus(jobId) {
    if (!this.runwayKey) {
      throw new Error('RunwayML API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.runwayml.com/v1/image-to-video/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.runwayKey}`
          }
        }
      );

      const status = response.data.status;
      const progress = status === 'completed' ? 100 : 
                      status === 'processing' ? 50 : 
                      status === 'queued' ? 10 : 0;

      return {
        status: status === 'completed' ? 'completed' :
               status === 'failed' ? 'failed' :
               status === 'processing' ? 'processing' : 'queued',
        progress,
        videoUrl: response.data.output?.[0],
        error: status === 'failed' ? response.data.error : null,
        estimatedTimeRemaining: status === 'processing' ? 120 : null
      };
    } catch (error) {
      logger.error('RunwayML status error:', error);
      throw error;
    }
  }

  /**
   * Get Pika Labs status
   */
  async getPikaStatus(jobId) {
    if (!this.pikaKey) {
      throw new Error('Pika Labs API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.pika.art/v1/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.pikaKey}`
          }
        }
      );

      const status = response.data.status;
      const progress = status === 'completed' ? 100 : 
                      status === 'processing' ? 50 : 0;

      return {
        status: status === 'completed' ? 'completed' :
               status === 'failed' ? 'failed' :
               status === 'processing' ? 'processing' : 'queued',
        progress,
        videoUrl: response.data.video_url,
        error: status === 'failed' ? response.data.error : null,
        estimatedTimeRemaining: status === 'processing' ? 60 : null
      };
    } catch (error) {
      logger.error('Pika Labs status error:', error);
      throw error;
    }
  }

  /**
   * Get MiniMax status
   */
  async getMiniMaxStatus(jobId) {
    if (!this.minimaxKey) {
      throw new Error('MiniMax API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.minimax.chat/v1/video_status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.minimaxKey}`
          }
        }
      );

      const status = response.data.status;
      const progress = status === 'completed' ? 100 : 
                      status === 'processing' ? 50 : 0;

      return {
        status: status === 'completed' ? 'completed' :
               status === 'failed' ? 'failed' :
               status === 'processing' ? 'processing' : 'queued',
        progress,
        videoUrl: response.data.video_url,
        error: status === 'failed' ? response.data.error : null,
        estimatedTimeRemaining: status === 'processing' ? 120 : null
      };
    } catch (error) {
      logger.error('MiniMax status error:', error);
      throw error;
    }
  }

  /**
   * Cancel video generation
   */
  async cancelVideoGeneration(jobId, provider) {
    try {
      // Most providers don't support cancellation
      // This would be handled by marking as cancelled in Firestore
      logger.info('Video generation cancellation requested', { jobId, provider });
      return { success: true, message: 'Cancellation request received' };
    } catch (error) {
      logger.error('Video cancellation error:', error);
      throw new Error(`Failed to cancel video generation: ${error.message}`);
    }
  }

  /**
   * Upload video to Firebase Storage
   */
  async uploadToStorage(videoUrl, path) {
    try {
      if (!this.storageBucket) {
        logger.warn('Firebase Storage not configured, returning original URL');
        return videoUrl;
      }

      // Sanitize path to prevent path traversal
      const sanitizedPath = path.split('/').map(part => sanitizeFilename(part, 'mp4')).join('/');
      const bucket = admin.storage().bucket(this.storageBucket);
      const file = bucket.file(sanitizedPath);

      // Validate URL to prevent SSRF
      const urlValidation = validateUrl(videoUrl, false);
      if (!urlValidation.valid) {
        throw new Error(`Invalid video URL: ${urlValidation.error}`);
      }

      // Download video
      const response = await axios.get(urlValidation.url, { 
        responseType: 'arraybuffer',
        timeout: 120000, // 2 minute timeout for videos
        maxContentLength: 500 * 1024 * 1024, // 500MB max
        validateStatus: (status) => status === 200
      });
      const videoBuffer = Buffer.from(response.data);

      // Upload to Firebase Storage
      await file.save(videoBuffer, {
        metadata: {
          contentType: 'video/mp4',
          cacheControl: 'public, max-age=31536000'
        }
      });

      await file.makePublic();

      return `https://storage.googleapis.com/${this.storageBucket}/${path}`;
    } catch (error) {
      logger.error('Storage upload error:', error);
      return videoUrl;
    }
  }

  /**
   * Get aspect ratio from resolution
   */
  getAspectRatio(resolution) {
    if (resolution === '1080p' || resolution === '1920x1080') return '16:9';
    if (resolution === '720p' || resolution === '1280x720') return '16:9';
    if (resolution === '512p' || resolution === '910x512') return '16:9';
    return '16:9'; // Default
  }
}

module.exports = new VideoGenerationService();

