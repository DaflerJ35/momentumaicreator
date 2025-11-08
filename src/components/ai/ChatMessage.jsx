import { memo } from 'react';
import { Bot, User, Check, Copy } from 'lucide-react';
import { Button } from '../ui/button';

export const ChatMessage = memo(({ message, onCopy, copiedId }) => {
  const isUser = message.role === 'user';
  const isCopied = copiedId === message.id;

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      role="listitem"
      aria-label={`${isUser ? 'Your message' : 'AI response'}`}
    >
      <div 
        className={`max-w-3xl rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-slate-100 dark:bg-slate-800'
        }`}
      >
        <div className="flex items-center mb-1">
          {isUser ? (
            <User className="h-4 w-4 mr-2 text-blue-200" />
          ) : (
            <Bot className="h-4 w-4 mr-2 text-slate-500" />
          )}
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-slate-400 ml-2">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <div className="prose dark:prose-invert max-w-none text-sm">
          {message.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph || <br />}</p>
          ))}
        </div>
        {!isUser && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={() => onCopy(message.content, message.id)}
              aria-label={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
              {isCopied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
