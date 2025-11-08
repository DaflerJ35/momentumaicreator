import { memo } from 'react';
import { Check, Copy, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

export const TrainingDataList = memo(({ 
  trainingData, 
  copiedId, 
  onCopy, 
  onDelete 
}) => {
  if (trainingData.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
        <p className="text-slate-500">No training examples yet</p>
        <p className="text-sm text-slate-400 mt-1">Add examples of your writing to train the AI</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {trainingData.map((item) => (
        <div 
          key={item.id}
          className="group relative p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => onCopy(item.content, item.id)}
              aria-label="Copy to clipboard"
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
              onClick={() => onDelete(item.id)}
              aria-label="Delete example"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
});

TrainingDataList.displayName = 'TrainingDataList';
