import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChatMessage } from './ChatMessage';

export const ChatInterface = memo(({ 
  messages, 
  onSendMessage, 
  isGenerating, 
  onVoiceCommand, 
  isListening,
  onToggleListening,
  copiedId,
  onCopy
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isGenerating) return;
    onSendMessage(inputValue);
    setInputValue('');
  }, [inputValue, isGenerating, onSendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onCopy={onCopy}
              copiedId={copiedId}
            />
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
            <p className="text-slate-500">Your conversation will appear here</p>
            <p className="text-sm text-slate-400 mt-1">
              Start a conversation or ask me to help you with your writing
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex w-full items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-12"
              aria-label="Type your message"
              disabled={isGenerating}
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
          <Button 
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isGenerating}
            aria-label="Send message"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';
