import { memo, useRef, useState } from 'react';
import { FileText, Upload, Download, Brain, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TrainingDataList } from './TrainingDataList';

export const TrainingDataForm = memo(({ 
  trainingData = [], 
  onAddExample, 
  onDeleteExample, 
  onExportData, 
  onTrainModel, 
  isTraining, 
  trainingProgress,
  trainingComplete,
  onCopyExample,
  copiedId
}) => {
  const [newExample, setNewExample] = useState('');
  const [newTags, setNewTags] = useState('');
  const fileInputRef = useRef(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newExample.trim()) return;
    
    const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    onAddExample(newExample, tags);
    setNewExample('');
    setNewTags('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        // For simplicity, we'll just add the entire content as one example
        // In a real app, you might want to parse the content more intelligently
        onAddExample(content, ['imported']);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    };

    if (file.type === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="new-example">Add a writing example</Label>
          <Input
            id="new-example"
            placeholder="Paste or type an example of your writing..."
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            className="mt-1"
            aria-label="Add a writing example"
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
            aria-label="Add tags to categorize your example"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button"
            onClick={handleAdd}
            disabled={!newExample.trim()}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Example
          </Button>
          <Button 
            type="button"
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
              aria-label="Import training data from file"
            />
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h3 className="font-medium">Your Training Data</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportData}
              disabled={trainingData.length === 0}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button 
              onClick={onTrainModel}
              disabled={isTraining || trainingData.length < 3}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 flex-1"
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
                role="progressbar"
                aria-valuenow={trainingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
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

        <TrainingDataList 
          trainingData={trainingData} 
          onDelete={onDeleteExample}
          onCopy={onCopyExample}
          copiedId={copiedId}
        />
      </div>
    </div>
  );
});

TrainingDataForm.displayName = 'TrainingDataForm';
