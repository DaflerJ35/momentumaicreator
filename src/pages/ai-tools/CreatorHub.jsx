import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Check, Copy, Upload, Brain, FileText, Sparkles, Loader2, Mic, MicOff, Bot, User, Send } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { useAI } from '../../lib/ai';
import { useAuth } from '../../contexts/AuthContext';
import VoiceCommand from '../../components/VoiceCommand';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

// Sample training data
const SAMPLE_TRAINING_DATA = [
  {
    id: 'sample1',
    type: 'example',
    content: 'Here\'s how I would write a tweet about AI: "Just tried the new Gemini model and it\'s mind-blowing! The way it understands context is on another level. #AI #Gemini"',
    tags: ['tone', 'style', 'social']
  },
  {
    id: 'sample2',
    type: 'example',
    content: 'When writing emails, I always start with a friendly greeting and get straight to the point. For example: "Hi [Name], I hope this message finds you well. I\'m reaching out to discuss our upcoming project..."',
    tags: ['email', 'professional', 'communication']
  }
];

const CreatorHub = () => {
  const [activeTab, setActiveTab] = useState('brainstorm');
  const [trainingData, setTrainingData] = useState(SAMPLE_TRAINING_DATA);
  const [newExample, setNewExample] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [conversation, setConversation] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I\'m your AI writing assistant. I can help you brainstorm ideas, draft content, or refine your writing. What would you like to work on?' }
  ]);
  const [message, setMessage] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelSettings, setModelSettings] = useState({
    creativity: 0.7,
    formality: 0.5,
    detail: 0.6,
    usePersonalData: true,
    usePreviousContent: true,
    voiceStyle: 'conversational'
  });
  
  const { toast } = useToast();
  const { generateContent } = useAI();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Load training data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('creatorHubTrainingData');
    if (savedData) {
      setTrainingData(JSON.parse(savedData));
    }
  }, []);

  // Save training data to localStorage when it changes
  useEffect(() => {
    if (trainingData.length > 0) {
      localStorage.setItem('creatorHubTrainingData', JSON.stringify(trainingData));
    }
  }, [trainingData]);

  const handleAddExample = () => {
    if (!newExample.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some example content.',
        variant: 'destructive',
      });
      return;
    }

    const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const newTrainingItem = {
      id: uuidv4(),
      type: 'example',
      content: newExample,
      tags: [...tags, 'user-added'],
      timestamp: new Date().toISOString()
    };

    setTrainingData(prev => [newTrainingItem, ...prev]);
    setNewExample('');
    setNewTags('');
    
    toast({
      title: 'Example added!',
      description: 'Your writing example has been added to the training data.',
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain' && file.type !== 'application/json') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a .txt or .json file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let content = event.target.result;
        let newItems = [];

        if (file.type === 'application/json') {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            newItems = jsonData.map(item => ({
              id: uuidv4(),
              type: item.type || 'example',
              content: item.content || '',
              tags: [...(item.tags || []), 'imported'],
              timestamp: new Date().toISOString()
            }));
          } else {
            throw new Error('Invalid JSON format');
          }
        } else {
          // For text files, split by double newlines and create examples
          const examples = content.split('\n\n').filter(Boolean);
          newItems = examples.map(example => ({
            id: uuidv4(),
            type: 'example',
            content: example.trim(),
            tags: ['imported', 'text-import'],
            timestamp: new Date().toISOString()
          }));
        }

        setTrainingData(prev => [...newItems, ...prev]);
        
        toast({
          title: 'Import successful',
          description: `Added ${newItems.length} new examples to your training data.`,
        });
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: 'Error processing file',
          description: 'Please check the file format and try again.',
          variant: 'destructive',
        });
      }
    };

    if (file.type === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDeleteExample = (id) => {
    setTrainingData(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Example removed',
      description: 'The example has been removed from your training data.',
    });
  };

  const trainModel = async () => {
    if (trainingData.length < 3) {
      toast({
        title: 'Not enough data',
        description: 'Please add at least 3 examples before training.',
        variant: 'destructive',
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 20) + 5;
        if (newProgress >= 95) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    try {
      // In a real app, you would send the training data to your backend
      // For now, we'll simulate a successful training
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setTrainingProgress(100);
      
      toast({
        title: 'Training complete!',
        description: 'Your AI model has been trained with your writing style.',
      });
      
      setTrainingComplete(true);
    } catch (error) {
      console.error('Training failed:', error);
      toast({
        title: 'Training failed',
        description: 'There was an error training your model. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsGenerating(true);

    try {
      // Get the most recent messages for context
      const recentMessages = conversation.slice(-4);
      const messagesForAI = [
        {
          role: 'system',
          content: `You are an AI writing assistant that helps users create content in their own voice. 
          Use the following writing examples to match the user's style: 
          ${trainingData.slice(0, 3).map(item => item.content).join('\n\n')}
          
          Current settings: 
          - Creativity: ${modelSettings.creativity}
          - Formality: modelSettings.formality > 0.7 ? 'Formal' : modelSettings.formality < 0.3 ? 'Casual' : 'Neutral'}
          - Detail: modelSettings.detail > 0.7 ? 'High' : modelSettings.detail < 0.3 ? 'Low' : 'Medium'}
          - Voice Style: ${modelSettings.voiceStyle}
          
          Respond naturally to the user's request while maintaining their style.`
        },
        ...recentMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await generateContent({
        messages: messagesForAI,
        temperature: modelSettings.creativity,
        maxTokens: 1000,
      });

      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response || 'I\'m not sure how to respond to that.',
        timestamp: new Date().toISOString()
      };

      setConversation(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command.toLowerCase().includes('brainstorm') || command.toLowerCase().includes('ideas')) {
      setActiveTab('brainstorm');
      setMessage('Help me brainstorm some content ideas about ' + command);
    } else if (command.toLowerCase().includes('draft')) {
      setActiveTab('draft');
      setMessage('Help me draft content about ' + command);
    } else if (command.toLowerCase().includes('train') || command.toLowerCase().includes('teach')) {
      setActiveTab('train');
      toast({
        title: 'Ready to train',
        description: 'You can now add examples to train me with your writing style.',
      });
    } else {
      setMessage(command);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
    });
  };

  const exportTrainingData = () => {
    const data = JSON.stringify(trainingData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    saveAs(blob, `creator-hub-training-${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Creator Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Train your personal AI writing assistant
            </p>
          </div>
          
          <VoiceCommand onCommand={handleVoiceCommand} isActive={isListening} />
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="brainstorm">
              <Sparkles className="h-4 w-4 mr-2" />
              Brainstorm
            </TabsTrigger>
            <TabsTrigger value="draft">
              <FileText className="h-4 w-4 mr-2" />
              Draft Assistant
            </TabsTrigger>
            <TabsTrigger value="train">
              <Brain className="h-4 w-4 mr-2" />
              Train AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brainstorm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brainstorm with AI</CardTitle>
                <CardDescription>
                  Get creative ideas and outlines for your content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="brainstorm-topic">Topic or Theme</Label>
                        <Input
                          id="brainstorm-topic"
                          placeholder="e.g., sustainable living, AI in education, travel tips"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleListening}
                            className={isListening ? 'bg-slate-100 dark:bg-slate-800' : ''}
                          >
                            {isListening ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="text-sm text-slate-500">
                            {isListening ? 'Listening...' : 'Voice input'}
                          </span>
                        </div>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!message.trim() || isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Generate Ideas
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">Your AI-Generated Ideas</h3>
                    <div className="space-y-4">
                      {conversation.filter(msg => msg.role === 'assistant').length > 1 ? (
                        conversation
                          .filter(msg => msg.role === 'assistant' && msg.id > 1)
                          .map((msg) => (
                            <Card key={msg.id} className="relative group">
                              <CardContent className="p-4">
                                <div className="prose dark:prose-invert max-w-none">
                                  {msg.content.split('\n').map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                  ))}
                                </div>
                              </CardContent>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyToClipboard(msg.content, msg.id)}
                                  title="Copy to clipboard"
                                >
                                  {copiedId === msg.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </Card>
                          ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
                          <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-slate-500">Your AI-generated ideas will appear here</p>
                          <p className="text-sm text-slate-400 mt-1">Try asking for blog topics, social media ideas, or content outlines</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Draft Assistant</CardTitle>
                <CardDescription>
                  Get help writing and refining your content in your unique voice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="draft-prompt">What would you like to write about?</Label>
                        <Textarea
                          id="draft-prompt"
                          placeholder="e.g., A blog post about the benefits of meditation, A tweet thread about AI ethics, An email to my team about the new project..."
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleListening}
                            className={isListening ? 'bg-slate-100 dark:bg-slate-800' : ''}
                          >
                            {isListening ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="text-sm text-slate-500">
                            {isListening ? 'Listening...' : 'Voice input'}
                          </span>
                        </div>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!message.trim() || isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Generate Draft
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">Your Drafts</h3>
                    <div className="space-y-4">
                      {conversation.length > 1 ? (
                        <div className="space-y-4">
                          {conversation.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-3xl rounded-lg p-4 ${
                                  msg.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center mb-1">
                                  {msg.role === 'assistant' ? (
                                    <Bot className="h-4 w-4 mr-2 text-slate-500" />
                                  ) : (
                                    <User className="h-4 w-4 mr-2 text-blue-200" />
                                  )}
                                  <span className="text-xs font-medium">
                                    {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                                  </span>
                                  <span className="text-xs text-slate-400 ml-2">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="prose dark:prose-invert max-w-none">
                                  {msg.content.split('\n').map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                  ))}
                                </div>
                                {msg.role === 'assistant' && (
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                      onClick={() => copyToClipboard(msg.content, msg.id)}
                                      title="Copy to clipboard"
                                    >
                                      {copiedId === msg.id ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-slate-500">Your draft content will appear here</p>
                          <p className="text-sm text-slate-400 mt-1">Ask me to help you write, edit, or refine your content</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="train" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Train Your AI</CardTitle>
                <CardDescription>
                  Teach me your writing style by providing examples of your content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-example">Add a writing example</Label>
                      <Textarea
                        id="new-example"
                        placeholder="Paste or type an example of your writing..."
                        rows={4}
                        value={newExample}
                        onChange={(e) => setNewExample(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., blog, professional, casual, email"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={handleAddExample}
                        disabled={!newExample.trim()}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Example
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import from File
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".txt,.json"
                          className="hidden"
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Your Training Data</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={exportTrainingData}
                          disabled={trainingData.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button 
                          onClick={trainModel}
                          disabled={isTraining || trainingData.length < 3}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                        >
                          {isTraining ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 mr-2" />
                          )}
                          {isTraining ? 'Training...' : 'Train AI Model'}
                        </Button>
                      </div>
                    </div>

                    {isTraining && (
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Training in progress...</span>
                          <span>{trainingProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${trainingProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          This may take a few moments. You can continue using other features.
                        </p>
                      </div>
                    )}

                    {trainingComplete && (
                      <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-emerald-500 mr-2" />
                          <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                            Training complete! Your AI model has been updated with your writing style.
                          </p>
                        </div>
                      </div>
                    )}

                    {trainingData.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {trainingData.map((item) => (
                          <div 
                            key={item.id}
                            className="group relative p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <div className="prose dark:prose-invert max-w-none text-sm">
                              {item.content.length > 200 
                                ? `${item.content.substring(0, 200)}...` 
                                : item.content}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.tags?.map((tag, i) => (
                                <span 
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                onClick={() => copyToClipboard(item.content, item.id)}
                                title="Copy to clipboard"
                              >
                                {copiedId === item.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => handleDeleteExample(item.id)}
                                title="Delete example"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-slate-500">No training examples yet</p>
                        <p className="text-sm text-slate-400 mt-1">Add examples of your writing to train the AI</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Model Settings</CardTitle>
                <CardDescription>
                  Customize how your AI assistant generates content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="creativity">Creativity</Label>
                      <span className="text-sm text-slate-500">
                        {modelSettings.creativity < 0.4 ? 'Precise' : 
                         modelSettings.creativity < 0.7 ? 'Balanced' : 'Creative'}
                      </span>
                    </div>
                    <input
                      id="creativity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelSettings.creativity}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        creativity: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>More Factual</span>
                      <span>More Creative</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="formality">Formality</Label>
                      <span className="text-sm text-slate-500">
                        {modelSettings.formality < 0.4 ? 'Casual' : 
                         modelSettings.formality < 0.7 ? 'Neutral' : 'Formal'}
                      </span>
                    </div>
                    <input
                      id="formality"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelSettings.formality}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        formality: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Casual</span>
                      <span>Formal</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="detail">Detail Level</Label>
                      <span className="text-sm text-slate-500">
                        {modelSettings.detail < 0.4 ? 'Concise' : 
                         modelSettings.detail < 0.7 ? 'Moderate' : 'Detailed'}
                      </span>
                    </div>
                    <input
                      id="detail"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelSettings.detail}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        detail: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Brief</span>
                      <span>Detailed</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="use-personal-data">Use Personal Data</Label>
                        <p className="text-xs text-slate-500">
                          Allow the AI to reference your previous content
                        </p>
                      </div>
                      <Switch
                        id="use-personal-data"
                        checked={modelSettings.usePersonalData}
                        onCheckedChange={(checked) => setModelSettings(prev => ({
                          ...prev,
                          usePersonalData: checked
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="use-previous-content">Use Previous Context</Label>
                        <p className="text-xs text-slate-500">
                          Reference previous messages in the conversation
                        </p>
                      </div>
                      <Switch
                        id="use-previous-content"
                        checked={modelSettings.usePreviousContent}
                        onCheckedChange={(checked) => setModelSettings(prev => ({
                          ...prev,
                          usePreviousContent: checked
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="voice-style">Voice Style</Label>
                    <select
                      id="voice-style"
                      value={modelSettings.voiceStyle}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        voiceStyle: e.target.value
                      }))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm rounded-md bg-white dark:bg-slate-800"
                    >
                      <option value="conversational">Conversational</option>
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="humorous">Humorous</option>
                      <option value="inspirational">Inspirational</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorHub;
