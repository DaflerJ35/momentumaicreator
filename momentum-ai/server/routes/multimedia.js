const express = require('express');
const router = express.Router();
const multer = require('multer');
const logger = require('../utils/logger');
const admin = require('../firebaseAdmin');
const { checkLimit, recordUsage } = require('../utils/subscriptionHelper');
const { 
  sanitizeFilename, 
  validateImageFile, 
  validateAudioFile,
  validateUrl,
  validatePrompt 
} = require('../utils/security');

// Configure multer for file uploads with file filtering
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Validate file type based on route
    const route = req.path;
    let isValid = false;

    if (route.includes('/image/')) {
      isValid = validateImageFile(file.mimetype, file.originalname);
    } else if (route.includes('/voice/')) {
      isValid = validateAudioFile(file.mimetype, file.originalname);
    } else {
      // Default: allow image and audio for unknown routes
      isValid = validateImageFile(file.mimetype, file.originalname) || 
                validateAudioFile(file.mimetype, file.originalname);
    }

    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types vary by endpoint.`), false);
    }
  }
});

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Log full error details for debugging
    logger.error('Token verification failed', { error: error.message, stack: error.stack });
    // Don't expose technical error details
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Apply auth middleware to all routes
router.use(verifyToken);

// Import multimedia services
const imageGenerationService = require('../services/imageGenerationService');
const videoGenerationService = require('../services/videoGenerationService');
const voiceGenerationService = require('../services/voiceGenerationService');

// ==================== IMAGE GENERATION ROUTES ====================

// Generate image from prompt
router.post('/image/generate', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { prompt, provider, size, style, quality, n, negativePrompt, referenceImage } = req.body;

    // Validate prompt
    const promptValidation = validatePrompt(prompt, 10000);
    if (!promptValidation.valid) {
      return res.status(400).json({ error: promptValidation.error });
    }

    // Validate reference image URL if provided
    let validatedReferenceImage = null;
    if (referenceImage) {
      const urlValidation = await validateUrl(referenceImage, true);
      if (!urlValidation.valid) {
        return res.status(400).json({ error: `Invalid reference image URL: ${urlValidation.error}` });
      }
      validatedReferenceImage = urlValidation.url;
    }

    // Validate size
    const allowedSizes = ['1024x1024', '1792x1024', '1024x1792'];
    const validSize = allowedSizes.includes(size) ? size : '1024x1024';

    // Validate n (number of images)
    const validN = Math.min(Math.max(1, parseInt(n) || 1), 4); // Limit to 1-4

    // Check user's plan limits
    const limitCheck = await checkLimit(userId, 'image', validN);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: limitCheck.reason,
        plan: limitCheck.plan,
        used: limitCheck.used,
        limit: limitCheck.limit,
      });
    }
    
    const result = await imageGenerationService.generateImage(promptValidation.prompt, {
      provider,
      size: validSize,
      style,
      quality,
      n: validN,
      negativePrompt,
      referenceImage: validatedReferenceImage
    });
    
    logger.info('Image generation completed', { userId, provider, size });
    
    // Record usage
    await recordUsage(userId, 'image', validN);
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Image generation error', { error: error.message, stack: error.stack, userId, provider });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to generate image. Please try again.' });
  }
});

// Edit existing image
router.post('/image/edit', upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.uid;
    const { imageUrl, prompt, provider, size, mask } = req.body;

    // Validate prompt
    const promptValidation = validatePrompt(prompt, 5000);
    if (!promptValidation.valid) {
      return res.status(400).json({ error: promptValidation.error });
    }

    // Validate image URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const urlValidation = await validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      return res.status(400).json({ error: `Invalid image URL: ${urlValidation.error}` });
    }

    const result = await imageGenerationService.editImage(urlValidation.url, promptValidation.prompt, {
      provider,
      size,
      mask
    });
    
    logger.info('Image edit completed', { userId, provider });
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Image editing error', { error: error.message, stack: error.stack, userId, provider });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to edit image. Please try again.' });
  }
});

// Generate variations
router.post('/image/variations', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { imageUrl, count, provider, size } = req.body;

    // Validate image URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const urlValidation = await validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      return res.status(400).json({ error: `Invalid image URL: ${urlValidation.error}` });
    }

    // Validate count
    const validCount = Math.min(Math.max(1, parseInt(count) || 4), 10); // Limit to 1-10

    const variations = await imageGenerationService.generateVariations(urlValidation.url, validCount, {
      provider,
      size
    });
    
    logger.info('Image variations completed', { userId, count });
    
    res.json({ variations });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Image variations error', { error: error.message, stack: error.stack, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to generate variations. Please try again.' });
  }
});

// Upload image to storage
router.post('/image/upload', upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.uid;
    const { imageData, filename } = req.body;

    let imageBuffer;
    let finalFilename;

    if (req.file) {
      // File uploaded via multer (already validated by multer fileFilter)
      imageBuffer = req.file.buffer;
      // Sanitize filename to prevent path traversal
      finalFilename = sanitizeFilename(req.file.originalname || `image-${Date.now()}.png`, 'png');
    } else if (imageData) {
      // Base64 data from body
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image data format. Must be a data URL with image MIME type.' });
      }
      const base64Data = imageData.split(',')[1] || imageData;
      imageBuffer = Buffer.from(base64Data, 'base64');
      // Sanitize filename
      finalFilename = sanitizeFilename(filename || `image-${Date.now()}.png`, 'png');
    } else {
      return res.status(400).json({ error: 'Image file or imageData is required' });
    }

    // Upload to Firebase Storage (filename already sanitized)
    const bucket = admin.storage().bucket();
    // Use sanitized filename and ensure user ID is safe
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const file = bucket.file(`images/${safeUserId}/${finalFilename}`);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
      }
    });

    await file.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    
    logger.info('Image uploaded', { userId, filename: finalFilename });
    
    res.json({ url });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Image upload error', { error: error.message, stack: error.stack, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to upload image. Please try again.' });
  }
});

// Upscale image
router.post('/image/upscale', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { imageUrl, provider, scale } = req.body;

    // Validate image URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const urlValidation = await validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      return res.status(400).json({ error: `Invalid image URL: ${urlValidation.error}` });
    }

    // Validate scale
    const validScale = Math.min(Math.max(1, parseFloat(scale) || 2), 4); // Limit to 1-4x

    const result = await imageGenerationService.upscaleImage(urlValidation.url, {
      provider,
      scale: validScale
    });
    
    logger.info('Image upscale completed', { userId, scale });
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Image upscaling error', { error: error.message, stack: error.stack, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to upscale image. Please try again.' });
  }
});

// ==================== VIDEO GENERATION ROUTES ====================

// Generate video from prompt
router.post('/video/generate', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { prompt, provider, model, resolution, duration, imagePreview, fps } = req.body;

    // Validate prompt or imagePreview
    if (!prompt && !imagePreview) {
      return res.status(400).json({ error: 'Prompt or image preview is required' });
    }

    if (prompt) {
      const promptValidation = validatePrompt(prompt, 5000);
      if (!promptValidation.valid) {
        return res.status(400).json({ error: promptValidation.error });
      }
    }

    // Validate image preview URL if provided
    let validatedImagePreview = null;
    if (imagePreview) {
      const urlValidation = await validateUrl(imagePreview, true);
      if (!urlValidation.valid) {
        return res.status(400).json({ error: `Invalid image preview URL: ${urlValidation.error}` });
      }
      validatedImagePreview = urlValidation.url;
    }

    // Validate duration
    const validDuration = Math.min(Math.max(1, parseInt(duration) || 6), 60); // Limit to 1-60 seconds

    // Check user's plan limits
    const limitCheck = await checkLimit(userId, 'video', validDuration);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: limitCheck.reason,
        plan: limitCheck.plan,
        used: limitCheck.used,
        limit: limitCheck.limit,
        requested: limitCheck.requested,
      });
    }
    
    const result = await videoGenerationService.generateVideo(prompt || null, {
      provider,
      model,
      resolution,
      duration: validDuration,
      imagePreview: validatedImagePreview,
      fps
    });
    
    // Store job in Firestore
    const db = admin.firestore();
    await db.collection('videoJobs').doc(result.jobId).set({
      userId,
      prompt,
      provider: result.provider,
      model,
      resolution,
      duration,
      status: result.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('Video generation job created', { userId, jobId: result.jobId, provider: result.provider });
    
    // Record usage
    await recordUsage(userId, 'video', 1);
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Video generation error', { error: error.message, stack: error.stack, userId, provider });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to start video generation. Please try again.' });
  }
});

// Get video generation status
router.get('/video/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const jobDoc = await db.collection('videoJobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDoc.data();
    if (job.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get status from provider
    const status = await videoGenerationService.getVideoStatus(jobId, job.provider || 'runway');
    
    // Update Firestore with latest status
    await db.collection('videoJobs').doc(jobId).update({
      status: status.status,
      progress: status.progress,
      videoUrl: status.videoUrl,
      error: status.error,
      estimatedTimeRemaining: status.estimatedTimeRemaining,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json(status);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Video status check error', { error: error.message, stack: error.stack, jobId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to get video status. Please try again.' });
  }
});

// Cancel video generation
router.post('/video/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const jobDoc = await db.collection('videoJobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDoc.data();
    if (job.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed or failed job' });
    }

    await videoGenerationService.cancelVideoGeneration(jobId, job.provider || 'runway');

    await db.collection('videoJobs').doc(jobId).update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Video generation cancelled' });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Video cancellation error', { error: error.message, stack: error.stack, jobId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to cancel video generation. Please try again.' });
  }
});

// Image to video
router.post('/video/image-to-video', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { imageUrl, prompt, provider, model, resolution, duration, motionStrength } = req.body;

    // Validate image URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const urlValidation = await validateUrl(imageUrl, true);
    if (!urlValidation.valid) {
      return res.status(400).json({ error: `Invalid image URL: ${urlValidation.error}` });
    }

    // Validate prompt if provided
    if (prompt) {
      const promptValidation = validatePrompt(prompt, 5000);
      if (!promptValidation.valid) {
        return res.status(400).json({ error: promptValidation.error });
      }
    }

    // Validate duration
    const validDuration = Math.min(Math.max(1, parseInt(duration) || 6), 60); // Limit to 1-60 seconds

    // Validate motion strength
    const validMotionStrength = Math.min(Math.max(0, parseFloat(motionStrength) || 0.5), 1); // Limit to 0-1

    // Check user's plan limits
    const limitCheck = await checkLimit(userId, 'video', validDuration);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: limitCheck.reason,
        plan: limitCheck.plan,
        used: limitCheck.used,
        limit: limitCheck.limit,
        requested: limitCheck.requested,
      });
    }

    const result = await videoGenerationService.imageToVideo(urlValidation.url, prompt || null, {
      provider,
      model,
      resolution,
      duration: validDuration,
      motionStrength: validMotionStrength
    });
    
    // Store job in Firestore
    const db = admin.firestore();
    await db.collection('videoJobs').doc(result.jobId).set({
      userId,
      imageUrl,
      prompt,
      provider: result.provider,
      model,
      resolution,
      duration,
      motionStrength,
      status: result.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('Image-to-video job created', { userId, jobId: result.jobId });
    
    // Record usage
    await recordUsage(userId, 'video', 1);
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Image-to-video error', { error: error.message, stack: error.stack, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to start image-to-video conversion. Please try again.' });
  }
});

// ==================== VOICE GENERATION ROUTES ====================

// Generate voice over
router.post('/voice/generate', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { text, voiceId, provider, language, speed, pitch, emotion, format } = req.body;

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
    }

    // Validate text length (limit to 5000 characters for voice generation)
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters' });
    }

    // Validate voiceId
    if (!voiceId || typeof voiceId !== 'string') {
      return res.status(400).json({ error: 'Voice ID is required and must be a string' });
    }

    // Validate speed, pitch if provided
    let validSpeed = speed;
    if (speed !== undefined) {
      validSpeed = Math.min(Math.max(0.5, parseFloat(speed) || 1.0), 2.0); // Limit to 0.5-2.0
    }
    let validPitch = pitch;
    if (pitch !== undefined) {
      validPitch = Math.min(Math.max(-1.0, parseFloat(pitch) || 0.0), 1.0); // Limit to -1.0 to 1.0
    }

    // Estimate voice duration (rough estimate: ~150 words per minute)
    const estimatedMinutes = Math.ceil(text.split(/\s+/).length / 150);
    
    // Check user's plan limits (minutes per month)
    const limitCheck = await checkLimit(userId, 'voice', estimatedMinutes);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: limitCheck.reason,
        plan: limitCheck.plan,
        used: limitCheck.used,
        limit: limitCheck.limit,
      });
    }
    
    const result = await voiceGenerationService.generateVoiceOver(text, voiceId, {
      provider,
      language,
      speed: validSpeed,
      pitch: validPitch,
      emotion,
      format
    });
    
    logger.info('Voice generation completed', { userId, provider, duration: result.duration });
    
    // Record usage (use actual duration from result if available, otherwise estimated)
    const actualMinutes = result.duration ? Math.ceil(result.duration / 60) : estimatedMinutes;
    await recordUsage(userId, 'voice', actualMinutes);
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Voice generation error', { error: error.message, stack: error.stack, userId, provider });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to generate voice over. Please try again.' });
  }
});

// List available voices
router.get('/voice/voices', async (req, res) => {
  try {
    const { provider, language, gender, style } = req.query;

    const voices = await voiceGenerationService.listAvailableVoices({
      provider,
      language,
      gender,
      style
    });

    res.json({ voices });
  } catch (error) {
    // Log full error details for debugging
    logger.error('List voices error', { error: error.message, stack: error.stack });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to list voices. Please try again.' });
  }
});

// Clone voice
router.post('/voice/clone', upload.array('samples', 5), async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, description, provider } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Audio samples are required' });
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Voice name is required and must be a non-empty string' });
    }

    // Validate name length
    if (name.length > 100) {
      return res.status(400).json({ error: 'Voice name exceeds maximum length of 100 characters' });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description exceeds maximum length of 500 characters' });
    }

    // Validate file count
    if (req.files.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 audio samples allowed' });
    }

    const result = await voiceGenerationService.cloneVoice(req.files, name, {
      provider,
      description
    });
    
    logger.info('Voice clone completed', { userId, provider, voiceId: result.voiceId });
    
    res.json(result);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Voice cloning error', { error: error.message, stack: error.stack, userId, provider });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to clone voice. Please try again.' });
  }
});

// Upload audio to storage
router.post('/voice/upload', upload.single('audio'), async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // File already validated by multer fileFilter
    const audioBuffer = req.file.buffer;
    // Sanitize filename to prevent path traversal
    const filename = sanitizeFilename(req.file.originalname || `audio-${Date.now()}.mp3`, 'mp3');

    // Upload to Firebase Storage (filename already sanitized)
    const bucket = admin.storage().bucket();
    // Use sanitized filename and ensure user ID is safe
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const file = bucket.file(`audio/${safeUserId}/${filename}`);
    
    await file.save(audioBuffer, {
      metadata: {
        contentType: req.file.mimetype || 'audio/mpeg',
        cacheControl: 'public, max-age=31536000'
      }
    });

    await file.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    
    logger.info('Audio uploaded', { userId, filename });
    
    res.json({ url });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Audio upload error', { error: error.message, stack: error.stack, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to upload audio. Please try again.' });
  }
});

module.exports = router;

