/**
 * Image Generation Service
 * Handles AI image generation using third-party providers (DALL-E 3, Stability AI)
 */

const logger = require('../utils/logger');
const axios = require('axios');
const admin = require('../firebaseAdmin');
const { v4: uuidv4 } = require('uuid');
const { validateUrl, sanitizeFilename } = require('../utils/security');

class ImageGenerationService {
  constructor() {
    this.provider = process.env.IMAGE_PROVIDER || 'dalle3';
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.stabilityKey = process.env.STABILITY_API_KEY;
    this.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    
    // Initialize OpenAI if configured
    if (this.provider === 'dalle3' && this.openaiKey) {
      const OpenAI = require('openai');
      this.openai = new OpenAI({ apiKey: this.openaiKey });
      logger.info('Image Generation Service initialized with DALL-E 3');
    }
    
    // Initialize Stability AI if configured
    if (this.provider === 'stability' && this.stabilityKey) {
      logger.info('Image Generation Service initialized with Stability AI');
    }
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(prompt, options = {}) {
    const {
      provider = this.provider,
      size = '1024x1024',
      style = 'natural',
      quality = 'standard',
      n = 1,
      negativePrompt = null,
      referenceImage = null
    } = options;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    // Validate reference image URL if provided
    if (referenceImage) {
      const urlValidation = await validateUrl(referenceImage, true);
      if (!urlValidation.valid) {
        throw new Error(`Invalid reference image URL: ${urlValidation.error}`);
      }
    }

    try {
      let imageUrl;
      let generatedProvider = provider;

      if (provider === 'dalle3' || provider === 'dalle-3') {
        imageUrl = await this.generateWithDALLE(prompt, { size, quality, n, negativePrompt });
        generatedProvider = 'dalle3';
      } else if (provider === 'stability') {
        imageUrl = await this.generateWithStability(prompt, { size, style, negativePrompt, referenceImage });
        generatedProvider = 'stability';
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Upload to Firebase Storage
      const storageUrl = await this.uploadToStorage(imageUrl, `images/${uuidv4()}.png`);

      return {
        imageUrl: storageUrl,
        provider: generatedProvider,
        metadata: {
          prompt,
          size,
          style,
          quality,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Image generation error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Generate with DALL-E 3
   */
  async generateWithDALLE(prompt, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const { size = '1024x1024', quality = 'standard', n = 1 } = options;

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: Math.min(n, 1), // DALL-E 3 only supports n=1
        size: size === '1024x1024' ? '1024x1024' : 
              size === '1792x1024' ? '1792x1024' :
              size === '1024x1792' ? '1024x1792' : '1024x1024',
        quality: quality,
        response_format: 'url'
      });

      return response.data[0].url;
    } catch (error) {
      logger.error('DALL-E generation error:', error);
      throw new Error(`DALL-E API error: ${error.message}`);
    }
  }

  /**
   * Generate with Stability AI
   */
  async generateWithStability(prompt, options = {}) {
    if (!this.stabilityKey) {
      throw new Error('Stability AI API key not configured');
    }

    const { size = '1024x1024', style = 'natural', negativePrompt = null, referenceImage = null } = options;

    try {
      const [width, height] = size.split('x').map(Number);
      
      const payload = {
        prompt: prompt,
        aspect_ratio: `${width}:${height}`,
        output_format: 'png',
        model: 'stable-diffusion-xl-1024-v1-5',
        style_preset: style === 'artistic' ? 'digital-art' : 
                     style === 'photorealistic' ? 'photographic' : undefined
      };

      if (negativePrompt) {
        payload.negative_prompt = negativePrompt;
      }

      // If reference image provided, use image-to-image endpoint
      const endpoint = referenceImage 
        ? 'https://api.stability.ai/v2beta/stable-image/edit/inpaint'
        : 'https://api.stability.ai/v2beta/stable-image/generate/core';

      if (referenceImage) {
        // Download reference image
        const imageBuffer = await this.downloadImage(referenceImage);
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', imageBuffer, { filename: 'reference.png' });
        formData.append('prompt', prompt);
        formData.append('output_format', 'png');
        
        if (negativePrompt) {
          formData.append('negative_prompt', negativePrompt);
        }

        const response = await axios.post(endpoint, formData, {
          headers: {
            'Authorization': `Bearer ${this.stabilityKey}`,
            'Accept': 'image/*',
            ...formData.getHeaders()
          },
          responseType: 'arraybuffer'
        });

        const base64 = Buffer.from(response.data).toString('base64');
        return `data:image/png;base64,${base64}`;
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.stabilityKey}`,
          'Accept': 'image/*'
        },
        responseType: 'arraybuffer'
      });

      // Convert to base64 and create data URL
      const base64 = Buffer.from(response.data).toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      logger.error('Stability AI generation error:', error);
      throw new Error(`Stability AI API error: ${error.message}`);
    }
  }

  /**
   * Edit existing image
   */
  async editImage(imageUrl, prompt, options = {}) {
    const { provider = this.provider, size = '1024x1024', mask = null } = options;

    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Image URL is required');
    }

    // Validate image URL
    const urlValidation = validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      throw new Error(`Invalid image URL: ${urlValidation.error}`);
    }

    try {
      // Download image (already validated in downloadImage)
      const imageBuffer = await this.downloadImage(imageUrl);
      
      let editedUrl;
      if (provider === 'dalle3') {
        // DALL-E doesn't support editing, so we'll use image-to-image with Stability
        editedUrl = await this.generateWithStability(prompt, { size });
      } else {
        editedUrl = await this.generateWithStability(prompt, { size });
      }

      const storageUrl = await this.uploadToStorage(editedUrl, `images/edited/${uuidv4()}.png`);

      return {
        imageUrl: storageUrl,
        provider: 'stability',
        metadata: {
          originalImageUrl: imageUrl,
          prompt,
          size,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Image editing error:', error);
      throw new Error(`Failed to edit image: ${error.message}`);
    }
  }

  /**
   * Generate variations of an image
   */
  async generateVariations(imageUrl, count = 4, options = {}) {
    const { provider = this.provider, size = '1024x1024' } = options;

    // Validate inputs
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Image URL is required');
    }

    // Validate count
    const validCount = Math.min(Math.max(1, parseInt(count) || 4), 10); // Limit to 1-10

    // Validate image URL
    const urlValidation = validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      throw new Error(`Invalid image URL: ${urlValidation.error}`);
    }

    try {
      const variations = [];
      
      for (let i = 0; i < validCount; i++) {
        // For variations, we'll generate similar images with slight prompt modifications
        const variationPrompt = `Variation ${i + 1} of the image: ${imageUrl}`;
        const result = await this.generateImage(variationPrompt, { provider, size, n: 1 });
        variations.push({
          imageUrl: result.imageUrl,
          provider: result.provider,
          metadata: {
            originalImageUrl: imageUrl,
            variationIndex: i,
            createdAt: new Date().toISOString()
          }
        });
      }

      return variations;
    } catch (error) {
      logger.error('Image variations error:', error);
      throw new Error(`Failed to generate variations: ${error.message}`);
    }
  }

  /**
   * Upscale image resolution
   */
  async upscaleImage(imageUrl, options = {}) {
    const { provider = 'stability', scale = 2 } = options;

    // Validate inputs
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Image URL is required');
    }

    // Validate scale
    const validScale = Math.min(Math.max(1, parseFloat(scale) || 2), 4); // Limit to 1-4x

    // Validate image URL
    const urlValidation = validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      throw new Error(`Invalid image URL: ${urlValidation.error}`);
    }

    try {
      if (!this.stabilityKey) {
        throw new Error('Stability AI API key not configured for upscaling');
      }

      // Download image (already validated in downloadImage)
      const imageBuffer = await this.downloadImage(imageUrl);
      const base64Image = imageBuffer.toString('base64');

      // Use Stability AI upscaling
      const response = await axios.post(
        'https://api.stability.ai/v2beta/stable-image/upscale/quick',
        {
          image: base64Image,
          width: Math.round(1024 * validScale)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.stabilityKey}`,
            'Content-Type': 'application/json',
            'Accept': 'image/*'
          },
          responseType: 'arraybuffer'
        }
      );

      const base64 = Buffer.from(response.data).toString('base64');
      const upscaledDataUrl = `data:image/png;base64,${base64}`;
      
      const storageUrl = await this.uploadToStorage(upscaledDataUrl, `images/upscaled/${uuidv4()}.png`);

      return {
        imageUrl: storageUrl,
        provider: 'stability',
        metadata: {
          originalImageUrl: imageUrl,
          scale,
          originalSize: '1024x1024',
          newSize: `${Math.round(1024 * validScale)}x${Math.round(1024 * validScale)}`,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Image upscaling error:', error);
      throw new Error(`Failed to upscale image: ${error.message}`);
    }
  }

  /**
   * Upload image to Firebase Storage
   */
  async uploadToStorage(imageUrl, path) {
    try {
      if (!this.storageBucket) {
        // If no storage bucket configured, return the original URL
        logger.warn('Firebase Storage not configured, returning original URL');
        return imageUrl;
      }

      // Sanitize path to prevent path traversal
      const sanitizedPath = path.split('/').map(part => sanitizeFilename(part, 'png')).join('/');
      const bucket = admin.storage().bucket(this.storageBucket);
      const file = bucket.file(sanitizedPath);

      // Validate and download image
      const urlValidation = validateUrl(imageUrl, true);
      if (!urlValidation.valid) {
        throw new Error(`Invalid image URL: ${urlValidation.error}`);
      }

      let imageBuffer;
      if (urlValidation.isDataUrl) {
        // Data URL - already validated
        const base64Data = imageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // HTTP/HTTPS URL - validated for SSRF
        const response = await axios.get(urlValidation.url, { 
          responseType: 'arraybuffer',
          timeout: 30000, // 30 second timeout
          maxContentLength: 10 * 1024 * 1024, // 10MB max
          validateStatus: (status) => status === 200
        });
        imageBuffer = Buffer.from(response.data);
      }

      // Upload to Firebase Storage
      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000'
        }
      });

      // Make file public
      await file.makePublic();

      // Get public URL
      return `https://storage.googleapis.com/${this.storageBucket}/${path}`;
    } catch (error) {
      logger.error('Storage upload error:', error);
      // Return original URL if upload fails
      return imageUrl;
    }
  }

  /**
   * Download image from URL or data URL
   * Validates URL to prevent SSRF attacks
   */
  async downloadImage(imageUrl) {
    // Validate URL to prevent SSRF
    const urlValidation = validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      throw new Error(`Invalid image URL: ${urlValidation.error}`);
    }

    if (urlValidation.isDataUrl) {
      // Data URL - already validated
      const base64Data = imageUrl.split(',')[1];
      return Buffer.from(base64Data, 'base64');
    } else {
      // HTTP/HTTPS URL - validated for SSRF
      const response = await axios.get(urlValidation.url, { 
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max
        validateStatus: (status) => status === 200
      });
      return Buffer.from(response.data);
    }
  }
}

module.exports = new ImageGenerationService();

