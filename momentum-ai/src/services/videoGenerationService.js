/**
 * Video Generation Service (Client)
 * Calls backend API endpoints for video generation
 */

import { apiRequestJson } from '../utils/apiClient';

class VideoGenerationService {
  /**
   * Generate video from text prompt
   * @param {string} prompt - Text description of the video
   * @param {object} options - Generation options
   * @returns {Promise<{jobId: string, status: string, estimatedTime: number}>}
   */
  async generateVideo(prompt, options = {}) {
    const {
      provider = 'runway',
      model = 'gen3a_turbo',
      resolution = '1080p',
      duration = 6,
      imagePreview = null,
      fps = 24
    } = options;

    const result = await apiRequestJson('/api/multimedia/video/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        provider,
        model,
        resolution,
        duration,
        imagePreview,
        fps
      })
    });

    return result;
  }

  /**
   * Check video generation status
   * @param {string} jobId - Job ID from generateVideo
   * @returns {Promise<{status: string, progress: number, videoUrl?: string}>}
   */
  async getVideoStatus(jobId) {
    const result = await apiRequestJson(`/api/multimedia/video/status/${jobId}`, {
      method: 'GET'
    });

    return {
      status: result.status,
      progress: result.progress || 0,
      videoUrl: result.videoUrl,
      error: result.error,
      estimatedTimeRemaining: result.estimatedTimeRemaining
    };
  }

  /**
   * Cancel video generation
   * @param {string} jobId - Job ID to cancel
   */
  async cancelVideoGeneration(jobId) {
    await apiRequestJson(`/api/multimedia/video/cancel/${jobId}`, {
      method: 'POST'
    });

    return { success: true };
  }

  /**
   * Animate static image into video
   */
  async imageToVideo(imageUrl, prompt, options = {}) {
    const {
      provider = 'runway',
      model = 'gen3a_turbo',
      resolution = '1080p',
      duration = 6,
      motionStrength = 0.5
    } = options;

    const result = await apiRequestJson('/api/multimedia/video/image-to-video', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        prompt,
        provider,
        model,
        resolution,
        duration,
        motionStrength
      })
    });

    return result;
  }
}

export default new VideoGenerationService();
