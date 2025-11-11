/**
 * Image Generation Service (Client)
 * Calls backend API endpoints for image generation
 */

import { apiRequestJson, apiRequestFormData } from '../utils/apiClient';

class ImageGenerationService {
  /**
   * Generate image from text prompt
   * @param {string} prompt - Text description of the image
   * @param {object} options - Generation options
   * @returns {Promise<{imageUrl: string, provider: string, metadata: object}>}
   */
  async generateImage(prompt, options = {}) {
    const {
      provider = 'dalle3',
      size = '1024x1024',
      style = 'natural',
      quality = 'standard',
      n = 1,
      negativePrompt = null,
      referenceImage = null
    } = options;

    const result = await apiRequestJson('/api/multimedia/image/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        provider,
        size,
        style,
        quality,
        n,
        negativePrompt,
        referenceImage
      })
    });

    return result;
  }

  /**
   * Edit existing image
   */
  async editImage(imageUrl, prompt, options = {}) {
    const { provider = 'dalle3', size = '1024x1024', mask = null } = options;

    const result = await apiRequestJson('/api/multimedia/image/edit', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        prompt,
        provider,
        size,
        mask
      })
    });

    return result;
  }

  /**
   * Generate variations of an image
   */
  async generateVariations(imageUrl, count = 4, options = {}) {
    const { provider = 'dalle3', size = '1024x1024' } = options;

    const result = await apiRequestJson('/api/multimedia/image/variations', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        count,
        provider,
        size
      })
    });

    return result.variations;
  }

  /**
   * Upscale image resolution
   */
  async upscaleImage(imageUrl, options = {}) {
    const { provider = 'stability', scale = 2 } = options;

    const result = await apiRequestJson('/api/multimedia/image/upscale', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        provider,
        scale
      })
    });

    return result;
  }

  /**
   * Upload image to storage
   */
  async uploadToStorage(imageData, filename) {
    const formData = new FormData();
    
    if (imageData instanceof File || imageData instanceof Blob) {
      formData.append('image', imageData, filename);
    } else if (typeof imageData === 'string') {
      // Base64 data URL
      formData.append('imageData', imageData);
      if (filename) {
        formData.append('filename', filename);
      }
    } else {
      throw new Error('Invalid image data format');
    }

    const response = await apiRequestFormData('/api/multimedia/image/upload', formData);
    const data = await response.json();
    return data.url;
  }
}

export default new ImageGenerationService();
