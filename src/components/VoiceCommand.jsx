import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const VoiceCommand = ({ onTranscript, onCommand, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported in this browser');
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        clearTimeout(silenceTimerRef.current);
        
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript.trim());

        // If we have final results, process the command after a short delay
        if (finalTranscript) {
          silenceTimerRef.current = setTimeout(() => {
            handleCommand(finalTranscript.trim());
          }, 1000);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access to use voice commands.');
        } else {
          toast.error('Error with speech recognition. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearTimeout(silenceTimerRef.current);
    };
  }, [isListening]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setTranscript('Listening...');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start voice recognition. Please try again.');
      }
    }
  }, [isListening]);

  // Process voice command
  const handleCommand = useCallback(async (command) => {
    if (!command) return;

    setIsProcessing(true);
    setTranscript(`Processing: "${command}"`);
    
    try {
      // Notify parent component of the transcript
      if (onTranscript) {
        onTranscript(command);
      }

      // If a command handler is provided, use it
      if (onCommand) {
        await onCommand(command);
      }
      
      // Show success feedback
      setTranscript('Command processed successfully!');
      setTimeout(() => setTranscript(''), 2000);
    } catch (error) {
      console.error('Error processing command:', error);
      setTranscript('Error processing command');
      toast.error('Failed to process voice command');
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  }, [onCommand, onTranscript]);

  // Speak text using speech synthesis
  const speak = useCallback((text, options = {}) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Set voice if specified
      if (options.voice) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === options.voice);
        if (voice) utterance.voice = voice;
      }
      
      window.speechSynthesis.speak(utterance);
      
      return new Promise(resolve => {
        utterance.onend = resolve;
      });
    }
    return Promise.resolve();
  }, []);

  // Get available voices
  const getVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  }, []);

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        type="button"
        variant={isListening ? 'destructive' : 'outline'}
        size="icon"
        onClick={toggleListening}
        disabled={disabled || isProcessing}
        className={`h-12 w-12 rounded-full transition-all ${
          isListening ? 'animate-pulse' : ''
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      
      {transcript && (
        <div className="text-sm text-center text-muted-foreground max-w-xs">
          {transcript}
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;
