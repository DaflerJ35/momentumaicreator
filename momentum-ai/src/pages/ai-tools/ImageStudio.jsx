import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Loader2, ImageIcon, Download, Copy, RefreshCw, X, Wand2, Sparkles } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import imageGenerationService from '../../services/imageGenerationService';

export default function ImageStudio() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('dalle3');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('natural');
  const [quality, setQuality] = useState('standard');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const stylePresets = [
    { id: 'photorealistic', label: 'Photorealistic', description: 'Ultra-realistic images' },
    { id: 'artistic', label: 'Artistic', description: 'Creative and artistic style' },
    { id: 'cartoon', label: 'Cartoon', description: 'Animated cartoon style' },
    { id: 'oil-painting', label: 'Oil Painting', description: 'Classic painting style' },
    { id: 'digital-art', label: 'Digital Art', description: 'Modern digital art' },
    { id: 'natural', label: 'Natural', description: 'Natural and balanced' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await imageGenerationService.generateImage(prompt, {
        provider,
        size,
        style,
        quality,
        n: 1,
        negativePrompt: negativePrompt || undefined,
        referenceImage: referenceImage || undefined
      });

      const newImage = {
        id: Date.now(),
        imageUrl: result.imageUrl,
        prompt,
        provider: result.provider,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (imageUrl, editPrompt) => {
    if (!editPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide edit instructions",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await imageGenerationService.editImage(imageUrl, editPrompt, {
        provider,
        size
      });

      const newImage = {
        id: Date.now(),
        imageUrl: result.imageUrl,
        prompt: editPrompt,
        originalImageUrl: imageUrl,
        provider: result.provider,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      
      toast({
        title: "Success",
        description: "Image edited successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to edit image.",
        variant: "destructive",
      });
    }
  };

  const handleVariations = async (imageUrl, count = 4) => {
    try {
      const result = await imageGenerationService.generateVariations(imageUrl, count, {
        provider,
        size
      });

      const newImages = result.map((variation, index) => ({
        id: Date.now() + index,
        imageUrl: variation.imageUrl,
        prompt: `Variation ${index + 1}`,
        originalImageUrl: imageUrl,
        provider: variation.provider,
        metadata: variation.metadata,
        timestamp: new Date().toISOString()
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
      
      toast({
        title: "Success",
        description: `Generated ${count} variations!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate variations.",
        variant: "destructive",
      });
    }
  };

  const handleUpscale = async (imageUrl) => {
    try {
      const result = await imageGenerationService.upscaleImage(imageUrl, {
        provider: 'stability',
        scale: 2
      });

      const newImage = {
        id: Date.now(),
        imageUrl: result.imageUrl,
        prompt: 'Upscaled image',
        originalImageUrl: imageUrl,
        provider: result.provider,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      
      toast({
        title: "Success",
        description: "Image upscaled successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upscale image.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (imageUrl) => {
    navigator.clipboard.writeText(imageUrl);
    toast({
      title: "Copied",
      description: "Image URL copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Image Studio</h1>
          <p className="text-muted-foreground">Create stunning images with AI in seconds</p>
        </div>
        <Button disabled={isGenerating} onClick={handleGenerate}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Panel - Settings */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your image generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dalle3">DALL-E 3 (OpenAI)</SelectItem>
                    <SelectItem value="stability">Stability AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Resolution</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">1024x1024 (Square)</SelectItem>
                    <SelectItem value="1792x1024">1792x1024 (Landscape)</SelectItem>
                    <SelectItem value="1024x1792">1024x1792 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style Preset</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {stylePresets.find(p => p.id === style)?.description}
                </p>
              </div>

              {provider === 'dalle3' && (
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                <Textarea
                  id="negative-prompt"
                  placeholder="Things to avoid in the image..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reference Image (Optional)</CardTitle>
              <CardDescription>Start from an existing image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center">
                {referenceImage ? (
                  <div className="relative w-full">
                    <img 
                      src={referenceImage} 
                      alt="Reference" 
                      className="rounded-md w-full h-48 object-cover mb-4"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => setReferenceImage(null)}
                    >
                      <X className="h-4 w-4" />
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

        {/* Center Panel - Prompt */}
        <div className="space-y-6 md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Image Prompt</CardTitle>
              <CardDescription>Describe the image you want to generate</CardDescription>
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
                  placeholder="A majestic sunset over a serene mountain landscape with vibrant colors, cinematic lighting, professional photography..."
                  className="min-h-[200px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label>Style Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {stylePresets.map(preset => (
                    <Button
                      key={preset.id}
                      variant={style === preset.id ? "default" : "outline"}
                      size="sm"
                      type="button"
                      onClick={() => setStyle(preset.id)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="border rounded-lg p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
                  {prompt ? (
                    <div className="text-center space-y-2">
                      {referenceImage && (
                        <div className="relative w-32 h-32 mx-auto mb-2">
                          <img 
                            src={referenceImage} 
                            alt="Reference" 
                            className="rounded-md w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {prompt}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p>Your image preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Gallery */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
              <CardDescription>{generatedImages.length} images generated</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="border rounded-lg p-2 space-y-2">
                      <div className="aspect-square bg-black/5 dark:bg-white/5 rounded-md overflow-hidden relative group">
                        <img 
                          src={image.imageUrl} 
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 bg-background/80"
                            onClick={() => handleCopy(image.imageUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 bg-background/80"
                            onClick={() => handleDownload(image.imageUrl, `image-${image.id}.png`)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{image.provider}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(image.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVariations(image.imageUrl, 4)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Variations
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpscale(image.imageUrl)}
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            Upscale
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-1">No images generated yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first image by entering a prompt above
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
