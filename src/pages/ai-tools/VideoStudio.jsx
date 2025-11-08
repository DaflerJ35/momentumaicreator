import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Loader2, ImageIcon, Video, Download, Copy, RefreshCw, X } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import videoGenerationService from '../../services/videoGenerationService';

export default function VideoStudio() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('MiniMax-Hailuo-2.3');
  const [resolution, setResolution] = useState('1080P');
  const [duration, setDuration] = useState(6);
  const [optimizePrompt, setOptimizePrompt] = useState(true);
  const [fastPretreatment, setFastPretreatment] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const pollJobStatus = async (jobId, taskId) => {
    const interval = setInterval(async () => {
      try {
        const status = await videoGenerationService.getVideoStatus(jobId);
        setJobProgress(status.progress || 0);

        if (status.status === 'completed') {
          clearInterval(interval);
          setPollingInterval(null);
          setTasks(prev => prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', videoUrl: status.videoUrl, progress: 100 }
              : task
          ));
          toast({
            title: "Success",
            description: "Video generation completed!",
          });
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          setTasks(prev => prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'failed', error: status.error }
              : task
          ));
          toast({
            title: "Error",
            description: status.error || "Video generation failed",
            variant: "destructive",
          });
        } else {
          setTasks(prev => prev.map(task => 
            task.id === taskId 
              ? { ...task, status: status.status, progress: status.progress }
              : task
          ));
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 5000);

    setPollingInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleGenerate = async () => {
    if (!prompt.trim() && !imagePreview) {
      toast({
        title: "Error",
        description: "Please provide either a prompt or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = imagePreview 
        ? await videoGenerationService.imageToVideo(imagePreview, prompt, {
            provider: 'minimax',
            model,
            resolution,
            duration,
          })
        : await videoGenerationService.generateVideo(prompt, {
            provider: 'minimax',
            model,
            resolution,
            duration,
            imagePreview,
          });
      
      const taskId = Date.now();
      const newTask = {
        id: taskId,
        prompt,
        model,
        resolution,
        duration,
        status: result.status || 'queued',
        timestamp: new Date().toISOString(),
        jobId: result.jobId,
        provider: result.provider || 'runway',
        progress: 0,
        videoUrl: null
      };
      
      setTasks(prev => [newTask, ...prev]);
      
      // Start polling for status
      if (result.jobId) {
        pollJobStatus(result.jobId, taskId);
      }
      
      toast({
        title: "Success",
        description: "Video generation started! This may take a few minutes.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const cameraMoves = [
    { name: 'Truck Left', value: 'truck_left' },
    { name: 'Truck Right', value: 'truck_right' },
    { name: 'Dolly In', value: 'dolly_in' },
    { name: 'Dolly Out', value: 'dolly_out' },
    { name: 'Pan Left', value: 'pan_left' },
    { name: 'Pan Right', value: 'pan_right' },
    { name: 'Tilt Up', value: 'tilt_up' },
    { name: 'Tilt Down', value: 'tilt_down' },
  ];

  const addCameraMove = (move) => {
    setPrompt(prev => `${prev} [${move}] `);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Video Studio</h1>
          <p className="text-muted-foreground">Create stunning videos with AI in seconds</p>
        </div>
        <Button disabled={isGenerating} onClick={handleGenerate}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Video'
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Settings */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your video generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MiniMax-Hailuo-2.3">MiniMax Hailuo 2.3</SelectItem>
                    <SelectItem value="MiniMax-Hailuo-2.3-Fast">MiniMax Hailuo 2.3 Fast</SelectItem>
                    <SelectItem value="I2V-01-Director">I2V-01 Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080P">1080P (1920x1080)</SelectItem>
                    <SelectItem value="720P">720P (1280x720)</SelectItem>
                    <SelectItem value="512P">512P (910x512)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={(val) => setDuration(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="optimize-prompt">Optimize Prompt</Label>
                  <p className="text-xs text-muted-foreground">Enhance your prompt for better results</p>
                </div>
                <Switch 
                  id="optimize-prompt" 
                  checked={optimizePrompt} 
                  onCheckedChange={setOptimizePrompt} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fast-pretreatment">Fast Pretreatment</Label>
                  <p className="text-xs text-muted-foreground">Faster processing with slightly lower quality</p>
                </div>
                <Switch 
                  id="fast-pretreatment" 
                  checked={fastPretreatment} 
                  onCheckedChange={setFastPretreatment} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Input (Optional)</CardTitle>
              <CardDescription>Start from an existing image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="rounded-md w-full h-48 object-cover mb-4"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => setImagePreview(null)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop an image here, or click to select
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select Image
                    </Button>
                    <Input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Prompt and Preview */}
        <div className="space-y-6 md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Video Prompt</CardTitle>
              <CardDescription>Describe the video you want to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="prompt">Prompt</Label>
                  <span className="text-xs text-muted-foreground">
                    {prompt.length}/1000 characters
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="A cinematic shot of a sunset over the ocean with dramatic lighting..."
                  className="min-h-[150px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label>Camera Movements</Label>
                <div className="flex flex-wrap gap-2">
                  {cameraMoves.map((move) => (
                    <Button
                      key={move.value}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => addCameraMove(move.name)}
                    >
                      {move.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to add camera movements to your prompt
                </p>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="border rounded-lg p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
                  {prompt || imagePreview ? (
                    <div className="text-center space-y-2">
                      {imagePreview && (
                        <div className="relative w-32 h-32 mx-auto mb-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="rounded-md w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {prompt || 'Your video will be generated based on the image'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Video className="h-8 w-8 mx-auto mb-2" />
                      <p>Your video preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Videos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Generated Videos</h2>
        {tasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id}>
                <div className="aspect-video bg-black/5 dark:bg-white/5 flex items-center justify-center relative">
                  {task.status === 'completed' && task.videoUrl ? (
                    <video 
                      src={task.videoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Generating your video...</p>
                      {task.progress !== undefined && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-emerald-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{task.progress}%</p>
                        </div>
                      )}
                    </div>
                  )}
                  {task.status === 'completed' && task.videoUrl && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          navigator.clipboard.writeText(task.videoUrl);
                          toast({ title: "Copied!", description: "Video URL copied to clipboard" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <a href={task.videoUrl} download>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium line-clamp-1">
                        {task.prompt.substring(0, 30)}{task.prompt.length > 30 ? '...' : ''}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                    <span>{task.model}</span>
                    <span>•</span>
                    <span>{task.resolution}</span>
                    <span>•</span>
                    <span>{task.duration}s</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">No videos generated yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your first video by entering a prompt above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
