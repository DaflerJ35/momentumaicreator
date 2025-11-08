/**
 * Voice Generation Service (Client)
 * Calls backend API endpoints for voice generation
 */

import { apiRequestJson, apiRequestFormData } from '../utils/apiClient';

class VoiceGenerationService {
  /**
   * Generate voice over from text
   * @param {string} text - Text to convert to speech
   * @param {string} voiceId - Voice ID to use
   * @param {object} options - Voice options
   * @returns {Promise<{audioUrl: string, duration: number, provider: string}>}
   */
  async generateVoiceOver(text, voiceId, options = {}) {
    const {
      provider = 'elevenlabs',
      language = 'en',
      speed = 1.0,
      pitch = 1.0,
      emotion = 'neutral',
      format = 'mp3'
    } = options;

    const result = await apiRequestJson('/api/multimedia/voice/generate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        voiceId,
        provider,
        language,
        speed,
        pitch,
        emotion,
        format
      })
    });

    return result;
  }

  /**
   * List available voices
   */
  async listAvailableVoices(options = {}) {
    const { provider, language, gender, style } = options;

    const queryParams = new URLSearchParams();
    if (provider) queryParams.append('provider', provider);
    if (language) queryParams.append('language', language);
    if (gender) queryParams.append('gender', gender);
    if (style) queryParams.append('style', style);

    const endpoint = `/api/multimedia/voice/voices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const result = await apiRequestJson(endpoint, {
      method: 'GET'
    });

    return result.voices || [];
  }

  /**
   * Clone voice from audio samples
   */
  async cloneVoice(audioSamples, name, options = {}) {
    const { provider = 'elevenlabs', description = '' } = options;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('provider', provider);
    if (description) {
      formData.append('description', description);
    }

    // Add audio samples
    if (Array.isArray(audioSamples)) {
      audioSamples.forEach((file, index) => {
        if (file instanceof File) {
          formData.append('samples', file);
        } else if (file instanceof Blob) {
          formData.append('samples', file, `sample_${index}.mp3`);
        }
      });
    }

    const response = await apiRequestFormData('/api/multimedia/voice/clone', formData);
    const result = await response.json();
    return result;
  }

  /**
   * Upload audio to storage
   */
  async uploadAudioToStorage(audioBlob, filename) {
    const formData = new FormData();
    formData.append('audio', audioBlob, filename);

    const response = await apiRequestFormData('/api/multimedia/voice/upload', formData);
    const data = await response.json();
    return data.url;
  }

  /**
   * Get audio duration (helper method for client-side use)
   */
  async getAudioDuration(audioBlob) {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        // Fallback: estimate duration based on typical TTS rate
        resolve(0);
        URL.revokeObjectURL(url);
      };
      audio.src = url;
    });
  }
}

export default new VoiceGenerationService();
