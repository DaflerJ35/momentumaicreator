import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Loader2, Mic, Volume2, Download, Copy, Play, Pause, Upload, X } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import voiceGenerationService from '../../services/voiceGenerationService';

export default function VoiceStudio() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [provider, setProvider] = useState('elevenlabs');
  const [language, setLanguage] = useState('en');
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [emotion, setEmotion] = useState('neutral');
  const [format, setFormat] = useState('mp3');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [generatedAudios, setGeneratedAudios] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVoices();
  }, [provider, language]);

  const loadVoices = async () => {
    try {
      const voices = await voiceGenerationService.listAvailableVoices({
        provider,
        language
      });
      setAvailableVoices(voices);
      if (voices.length > 0 && !voiceId) {
        setVoiceId(voices[0].id);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      toast({
        title: "Error",
        description: "Failed to load voices",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please provide text to convert",
        variant: "destructive",
      });
      return;
    }

    if (!voiceId) {
      toast({
        title: "Error",
        description: "Please select a voice",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await voiceGenerationService.generateVoiceOver(text, voiceId, {
        provider,
        language,
        speed: speed[0],
        pitch: pitch[0],
        emotion,
        format
      });

      const newAudio = {
        id: Date.now(),
        audioUrl: result.audioUrl,
        text,
        voiceId,
        provider: result.provider,
        metadata: result.metadata,
        duration: result.duration,
        timestamp: new Date().toISOString()
      };

      setGeneratedAudios(prev => [newAudio, ...prev]);
      
      toast({
        title: "Success",
        description: "Voice over generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate voice over.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = (audioUrl, audioId) => {
    if (playingAudio === audioId) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudio(null);
    } else {
      // Play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(audioId);
      }
    }
  };

  const handleDownload = (audioUrl, filename) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename || 'generated-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (audioUrl) => {
    navigator.clipboard.writeText(audioUrl);
    toast({
      title: "Copied",
      description: "Audio URL copied to clipboard",
    });
  };

  const emotionOptions = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'calm', label: 'Calm' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Voice Studio</h1>
          <p className="text-muted-foreground">Create professional voice overs with AI text-to-speech</p>
        </div>
        <Button disabled={isGenerating} onClick={handleGenerate}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Generate Voice
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Panel - Voice Settings */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Configure your voice generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={(val) => {
                  setProvider(val);
                  setVoiceId('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    <SelectItem value="google">Google TTS</SelectItem>
                    <SelectItem value="openai">OpenAI TTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}{voice.gender ? ` (${voice.gender})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableVoices.find(v => v.id === voiceId)?.previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      const audio = new Audio(availableVoices.find(v => v.id === voiceId).previewUrl);
                      audio.play();
                    }}
                  >
                    <Play className="h-3 w-3 mr-2" />
                    Preview Voice
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emotion">Emotion/Style</Label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Speed: {speed[0].toFixed(1)}x</Label>
                <Slider
                  id="speed"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={speed}
                  onValueChange={setSpeed}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitch">Pitch: {pitch[0].toFixed(1)}</Label>
                <Slider
                  id="pitch"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={pitch}
                  onValueChange={setPitch}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Audio Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="ogg">OGG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Text Input */}
        <div className="space-y-6 md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="text">Text</Label>
                  <span className="text-xs text-muted-foreground">
                    {text.length} characters
                  </span>
                </div>
                <Textarea
                  id="text"
                  placeholder="Enter the text you want to convert to speech. You can use SSML tags for pronunciation hints and pauses."
                  className="min-h-[300px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setText(text + ' <break time="1s"/>')}
                  >
                    Add Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(text);
                      window.speechSynthesis.speak(utterance);
                    }}
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Preview (Browser)
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Estimated Duration</h3>
                <p className="text-sm text-muted-foreground">
                  ~{Math.ceil((text.split(/\s+/).length / 150) * 60 / speed[0])} seconds
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Generated Audio */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generated Audio</CardTitle>
              <CardDescription>{generatedAudios.length} audio files generated</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedAudios.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {generatedAudios.map((audio) => (
                    <div key={audio.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">{audio.text.substring(0, 50)}...</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{audio.provider}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {audio.duration}s • {new Date(audio.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <audio
                          ref={playingAudio === audio.id ? audioRef : null}
                          src={audio.audioUrl}
                          onEnded={() => setPlayingAudio(null)}
                          onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
                          className="hidden"
                        />
                        <Button
                          variant={playingAudio === audio.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePlay(audio.audioUrl, audio.id)}
                        >
                          {playingAudio === audio.id ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(audio.audioUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(audio.audioUrl, `audio-${audio.id}.${format}`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Volume2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-1">No audio generated yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first voice over by entering text above
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
