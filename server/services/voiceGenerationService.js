/**
 * Voice Generation Service
 * Handles AI voice generation and text-to-speech using third-party providers (ElevenLabs, Google TTS, OpenAI TTS)
 */

const logger = require('../utils/logger');
const axios = require('axios');
const admin = require('../firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

class VoiceGenerationService {
  constructor() {
    this.provider = process.env.VOICE_PROVIDER || 'elevenlabs';
    this.elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    this.googleTtsKey = process.env.GOOGLE_TTS_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    
    logger.info(`Voice Generation Service initialized with provider: ${this.provider}`);
  }

  /**
   * Generate voice over from text
   */
  async generateVoiceOver(text, voiceId, options = {}) {
    const {
      provider = this.provider,
      language = 'en',
      speed = 1.0,
      pitch = 1.0,
      emotion = 'neutral',
      format = 'mp3'
    } = options;

    try {
      let audioUrl;
      let duration = 0;

      if (provider === 'elevenlabs') {
        const result = await this.generateWithElevenLabs(text, voiceId, { speed, pitch, emotion });
        audioUrl = result.audioUrl;
        duration = result.duration;
      } else if (provider === 'google') {
        const result = await this.generateWithGoogleTTS(text, voiceId, { language, speed, pitch, format });
        audioUrl = result.audioUrl;
        duration = result.duration;
      } else if (provider === 'openai') {
        const result = await this.generateWithOpenAITTS(text, voiceId, { speed, format });
        audioUrl = result.audioUrl;
        duration = result.duration;
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Upload to Firebase Storage
      const storageUrl = await this.uploadToStorage(audioUrl, `audio/${uuidv4()}.${format}`);

      return {
        audioUrl: storageUrl,
        provider,
        duration,
        metadata: {
          text,
          voiceId,
          language,
          speed,
          pitch,
          emotion,
          format,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Voice generation error:', error);
      throw new Error(`Failed to generate voice over: ${error.message}`);
    }
  }

  /**
   * Generate with ElevenLabs
   */
  async generateWithElevenLabs(text, voiceId, options = {}) {
    if (!this.elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const { speed = 1.0, pitch = 1.0, emotion = 'neutral' } = options;

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: emotion === 'calm' ? 0.75 : emotion === 'energetic' ? 0.5 : 0.6,
            similarity_boost: 0.75,
            style: emotion === 'energetic' ? 0.5 : 0.0,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': this.elevenlabsKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert to base64 data URL
      const base64 = Buffer.from(response.data).toString('base64');
      const audioUrl = `data:audio/mp3;base64,${base64}`;
      
      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const duration = Math.ceil((wordCount / 150) * 60 / speed);

      return { audioUrl, duration };
    } catch (error) {
      logger.error('ElevenLabs generation error:', error);
      throw new Error(`ElevenLabs API error: ${error.message}`);
    }
  }

  /**
   * Generate with Google Cloud TTS
   */
  async generateWithGoogleTTS(text, voiceId, options = {}) {
    if (!this.googleTtsKey) {
      throw new Error('Google TTS API key not configured');
    }

    const { language = 'en', speed = 1.0, pitch = 1.0, format = 'mp3' } = options;

    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.googleTtsKey}`,
        {
          input: { text: text },
          voice: {
            languageCode: language,
            name: voiceId || `${language}-Standard-A`,
            ssmlGender: 'NEUTRAL'
          },
          audioConfig: {
            audioEncoding: format === 'mp3' ? 'MP3' : format === 'wav' ? 'LINEAR16' : 'OGG_OPUS',
            speakingRate: speed,
            pitch: pitch
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const audioContent = response.data.audioContent;
      const audioUrl = `data:audio/${format};base64,${audioContent}`;
      
      // Estimate duration
      const wordCount = text.split(/\s+/).length;
      const duration = Math.ceil((wordCount / 150) * 60 / speed);

      return { audioUrl, duration };
    } catch (error) {
      logger.error('Google TTS generation error:', error);
      throw new Error(`Google TTS API error: ${error.message}`);
    }
  }

  /**
   * Generate with OpenAI TTS
   */
  async generateWithOpenAITTS(text, voiceId, options = {}) {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { speed = 1.0, format = 'mp3' } = options;

    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: this.openaiKey });

      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceId || 'alloy',
        input: text,
        speed: speed,
        response_format: format
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const base64 = buffer.toString('base64');
      const audioUrl = `data:audio/${format};base64,${base64}`;
      
      // Estimate duration
      const wordCount = text.split(/\s+/).length;
      const duration = Math.ceil((wordCount / 150) * 60 / speed);

      return { audioUrl, duration };
    } catch (error) {
      logger.error('OpenAI TTS generation error:', error);
      throw new Error(`OpenAI TTS API error: ${error.message}`);
    }
  }

  /**
   * Generate speech with basic parameters
   */
  async generateSpeech(text, language, gender, style, options = {}) {
    const {
      provider = this.provider,
      speed = 1.0,
      pitch = 1.0,
      format = 'mp3'
    } = options;

    // Map gender and style to voice ID
    let voiceId;
    if (provider === 'elevenlabs') {
      voiceId = this.getElevenLabsVoiceId(gender, style);
    } else if (provider === 'google') {
      voiceId = this.getGoogleVoiceId(language, gender);
    } else {
      voiceId = this.getOpenAIVoiceId(gender);
    }

    return await this.generateVoiceOver(text, voiceId, {
      provider,
      language,
      speed,
      pitch,
      emotion: style,
      format
    });
  }

  /**
   * Clone voice from audio samples
   */
  async cloneVoice(audioSamples, name, options = {}) {
    const { provider = this.provider, description = '' } = options;

    try {
      if (provider === 'elevenlabs') {
        return await this.cloneWithElevenLabs(audioSamples, name, description);
      } else {
        throw new Error(`Voice cloning not supported for provider: ${provider}`);
      }
    } catch (error) {
      logger.error('Voice cloning error:', error);
      throw new Error(`Failed to clone voice: ${error.message}`);
    }
  }

  /**
   * Clone with ElevenLabs
   */
  async cloneWithElevenLabs(audioSamples, name, description) {
    if (!this.elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const FormData = require('form-data');
      const formData = new FormData();

      audioSamples.forEach((file, index) => {
        formData.append(`files[${index}]`, file.buffer, {
          filename: file.originalname || `sample_${index}.mp3`,
          contentType: file.mimetype || 'audio/mpeg'
        });
      });

      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(
        'https://api.elevenlabs.io/v1/voices/add',
        formData,
        {
          headers: {
            'xi-api-key': this.elevenlabsKey,
            ...formData.getHeaders()
          }
        }
      );

      return {
        voiceId: response.data.voice_id,
        provider: 'elevenlabs',
        metadata: {
          name,
          description,
          sampleCount: audioSamples.length,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('ElevenLabs cloning error:', error);
      throw new Error(`ElevenLabs cloning API error: ${error.message}`);
    }
  }

  /**
   * List available voices
   */
  async listAvailableVoices(options = {}) {
    const {
      provider = this.provider,
      language = null,
      gender = null,
      style = null
    } = options;

    try {
      if (provider === 'elevenlabs') {
        return await this.listElevenLabsVoices();
      } else if (provider === 'google') {
        return await this.listGoogleVoices(language, gender);
      } else if (provider === 'openai') {
        return await this.listOpenAIVoices();
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      logger.error('List voices error:', error);
      throw new Error(`Failed to list voices: ${error.message}`);
    }
  }

  /**
   * List ElevenLabs voices
   */
  async listElevenLabsVoices() {
    if (!this.elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.get(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'xi-api-key': this.elevenlabsKey
          }
        }
      );

      return response.data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        gender: voice.labels?.gender || 'neutral',
        language: voice.labels?.accent || 'en',
        style: voice.labels?.age || 'neutral',
        previewUrl: voice.preview_url
      }));
    } catch (error) {
      logger.error('ElevenLabs list voices error:', error);
      throw error;
    }
  }

  /**
   * List Google TTS voices
   */
  async listGoogleVoices(language, gender) {
    if (!this.googleTtsKey) {
      throw new Error('Google TTS API key not configured');
    }

    try {
      const url = language 
        ? `https://texttospeech.googleapis.com/v1/voices?key=${this.googleTtsKey}&languageCode=${language}`
        : `https://texttospeech.googleapis.com/v1/voices?key=${this.googleTtsKey}`;

      const response = await axios.get(url);

      let voices = response.data.voices.map(voice => ({
        id: voice.name,
        name: voice.name,
        gender: voice.ssmlGender?.toLowerCase() || 'neutral',
        language: voice.languageCodes?.[0] || 'en',
        style: 'professional'
      }));

      if (gender) {
        voices = voices.filter(v => v.gender === gender.toLowerCase());
      }

      return voices;
    } catch (error) {
      logger.error('Google TTS list voices error:', error);
      throw error;
    }
  }

  /**
   * List OpenAI TTS voices
   */
  async listOpenAIVoices() {
    return [
      { id: 'alloy', name: 'Alloy', gender: 'neutral', language: 'en', style: 'professional' },
      { id: 'echo', name: 'Echo', gender: 'male', language: 'en', style: 'professional' },
      { id: 'fable', name: 'Fable', gender: 'neutral', language: 'en', style: 'professional' },
      { id: 'onyx', name: 'Onyx', gender: 'male', language: 'en', style: 'professional' },
      { id: 'nova', name: 'Nova', gender: 'female', language: 'en', style: 'professional' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', language: 'en', style: 'professional' }
    ];
  }

  /**
   * Get ElevenLabs voice ID from gender and style
   */
  getElevenLabsVoiceId(gender, style) {
    // Default voice IDs - these should be mapped from actual API response
    if (gender === 'female' && style === 'professional') return 'EXAVITQu4vr4xnSDxMaL';
    if (gender === 'male' && style === 'professional') return 'pNInz6obpgDQGcFmaJgB';
    return 'EXAVITQu4vr4xnSDxMaL'; // Default
  }

  /**
   * Get Google voice ID from language and gender
   */
  getGoogleVoiceId(language, gender) {
    const code = language.split('-')[0];
    const genderCode = gender === 'female' ? 'C' : gender === 'male' ? 'B' : 'A';
    return `${language}-Standard-${genderCode}`;
  }

  /**
   * Get OpenAI voice ID from gender
   */
  getOpenAIVoiceId(gender) {
    if (gender === 'female') return 'nova';
    if (gender === 'male') return 'onyx';
    return 'alloy';
  }

  /**
   * Upload audio to Firebase Storage
   */
  async uploadToStorage(audioUrl, path) {
    try {
      if (!this.storageBucket) {
        logger.warn('Firebase Storage not configured, returning original URL');
        return audioUrl;
      }

      const bucket = admin.storage().bucket(this.storageBucket);
      const file = bucket.file(path);

      // Extract base64 data
      const base64Data = audioUrl.split(',')[1];
      const audioBuffer = Buffer.from(base64Data, 'base64');

      // Determine content type
      const format = path.split('.').pop();
      const contentType = format === 'mp3' ? 'audio/mpeg' : 
                         format === 'wav' ? 'audio/wav' : 
                         'audio/ogg';

      // Upload to Firebase Storage
      await file.save(audioBuffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000'
        }
      });

      await file.makePublic();

      return `https://storage.googleapis.com/${this.storageBucket}/${path}`;
    } catch (error) {
      logger.error('Storage upload error:', error);
      return audioUrl;
    }
  }
}

module.exports = new VoiceGenerationService();

