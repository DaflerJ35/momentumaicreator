import { memo, useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export const BrainstormForm = memo(({ 
  onGenerate, 
  isGenerating, 
  onToggleListening, 
  isListening,
  generatedIdeas = [],
  onCopyIdea,
  copiedId
}) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate(topic);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="topic">Topic or Theme</Label>
          <div className="relative mt-1">
            <Input
              id="topic"
              placeholder="e.g., sustainable living, AI in education, travel tips"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="pr-12"
              aria-label="Enter a topic to brainstorm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={onToggleListening}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Ideas
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <h3 className="font-medium mb-4">Generated Ideas</h3>
        <div className="space-y-4">
          {generatedIdeas.length > 0 ? (
            generatedIdeas.map((idea) => (
              <div 
                key={idea.id} 
                className="relative p-4 border border-slate-200 dark:border-slate-700 rounded-lg group"
              >
                <div className="prose dark:prose-invert max-w-none">
                  {idea.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onCopyIdea(idea.content, idea.id)}
                    aria-label={copiedId === idea.id ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {copiedId === idea.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-500">Your AI-generated ideas will appear here</p>
              <p className="text-sm text-slate-400 mt-1">
                Try asking for blog topics, social media ideas, or content outlines
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BrainstormForm.displayName = 'BrainstormForm';
