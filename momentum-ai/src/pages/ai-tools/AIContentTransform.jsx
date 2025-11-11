import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Check, Copy, Download, Loader2, Sparkles, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { useAI } from '../../lib/ai';
import { useAuth } from '../../contexts/AuthContext';
import VoiceCommand from '../../components/VoiceCommand';
import { saveAs } from 'file-saver';
import { exportToPdf, exportToDocx, exportToTxt, exportToJson, exportToHtml } from '../../lib/exportUtils';

const transformOptions = [
  { id: 'summarize', name: 'Summarize', description: 'Condense content into key points' },
  { id: 'expand', name: 'Expand', description: 'Add more detail and explanation' },
  { id: 'simplify', name: 'Simplify', description: 'Make content easier to understand' },
  { id: 'formal', name: 'Make Formal', description: 'Convert to professional/business tone' },
  { id: 'casual', name: 'Make Casual', description: 'Convert to friendly, conversational tone' },
  { id: 'persuasive', name: 'Make Persuasive', description: 'Enhance with persuasive language' },
  { id: 'story', name: 'Turn into Story', description: 'Convert into a narrative format' },
  { id: 'steps', name: 'Convert to Steps', description: 'Break down into numbered steps' },
  { id: 'questions', name: 'Generate Questions', description: 'Create questions from content' },
  { id: 'quotes', name: 'Extract Quotes', description: 'Pull out notable quotes' },
];

const toneOptions = [
  'Professional', 'Casual', 'Friendly', 'Authoritative', 'Humorous',
  'Inspirational', 'Urgent', 'Educational', 'Conversational', 'Persuasive'
];

const AIContentTransform = () => {
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [selectedTransform, setSelectedTransform] = useState('summarize');
  const [tone, setTone] = useState('Professional');
  const [isTransforming, setIsTransforming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const { toast } = useToast();
  const { generateContent } = useAI();
  const { currentUser } = useAuth();
  const exportRef = useRef(null);

  const transformContent = useCallback(async () => {
    if (!inputContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content to transform.',
        variant: 'destructive',
      });
      return;
    }

    setIsTransforming(true);
    
    try {
      const prompt = `Transform the following content by ${selectedTransform} with a ${tone} tone. 
      ${transformOptions.find(t => t.id === selectedTransform)?.description}.
      \n\nContent: ${inputContent}`;

      const response = await generateContent({
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      const newOutput = response || 'No transformation could be generated.';
      setOutputContent(newOutput);
      
      // Add to history
      const newHistory = [...history.slice(0, historyIndex + 1), newOutput];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      toast({
        title: 'Success',
        description: 'Content transformed successfully!',
      });
    } catch (error) {
      console.error('Error transforming content:', error);
      toast({
        title: 'Error',
        description: 'Failed to transform content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTransforming(false);
    }
  }, [inputContent, selectedTransform, tone, generateContent, toast, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setOutputContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setOutputContent(history[historyIndex + 1]);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format) => {
    if (!outputContent) return;
    
    setIsExporting(true);
    try {
      const fileName = `MomentumAI_${selectedTransform}_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'pdf':
          await exportToPdf(exportRef.current, fileName);
          break;
        case 'docx':
          await exportToDocx(outputContent, fileName);
          break;
        case 'txt':
          exportToTxt(outputContent, fileName);
          break;
        case 'json':
          exportToJson({ [selectedTransform]: outputContent }, fileName);
          break;
        case 'html':
          exportToHtml(outputContent, fileName);
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      toast({
        title: 'Success',
        description: `Content exported as ${format.toUpperCase()}!`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: `Could not export content as ${format.toUpperCase()}.`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('transform') || lowerCommand.includes('generate')) {
      transformContent();
    } else if (lowerCommand.includes('copy')) {
      handleCopy(outputContent);
    } else if (lowerCommand.includes('export')) {
      handleExport(exportFormat);
    } else if (lowerCommand.includes('undo')) {
      handleUndo();
    } else if (lowerCommand.includes('redo')) {
      handleRedo();
    } else if (lowerCommand.includes('clear')) {
      setInputContent('');
      setOutputContent('');
    }
  };

  const handleInputChange = (e) => {
    setInputContent(e.target.value);
  };

  const handleOutputChange = (e) => {
    setOutputContent(e.target.value);
  };

  const handleTransformSelect = (value) => {
    setSelectedTransform(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              AI Content Transform
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Repurpose and refine your content with AI
            </p>
          </div>
          
          <VoiceCommand onCommand={handleVoiceCommand} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="input-content">Input</Label>
              <div className="text-sm text-slate-500">
                {inputContent.length} characters • {inputContent.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
            <Textarea
              id="input-content"
              value={inputContent}
              onChange={handleInputChange}
              placeholder="Paste or type your content here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Output</Label>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-slate-500">
                  {outputContent.length} characters • {outputContent.split(/\s+/).filter(Boolean).length} words
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCopy(outputContent)}
                  disabled={!outputContent}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="relative">
              <Textarea
                value={outputContent}
                onChange={handleOutputChange}
                placeholder="Your transformed content will appear here..."
                className="min-h-[300px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
                readOnly={isTransforming}
              />
              {isTransforming && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-md">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-2" />
                    <p className="text-slate-300">Transforming content...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4">
            <Label>Transformation Type</Label>
            <Select value={selectedTransform} onValueChange={handleTransformSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a transformation" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {transformOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              {transformOptions.find(t => t.id === selectedTransform)?.description}
            </p>
          </div>

          <div className="space-y-4">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((toneOption) => (
                  <SelectItem key={toneOption} value={toneOption}>
                    {toneOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              Set the tone for the transformed content
            </p>
          </div>

          <div className="flex items-end space-x-2">
            <Button 
              onClick={transformContent}
              disabled={isTransforming || !inputContent.trim()}
              className="w-full"
            >
              {isTransforming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Transform Content
                </>
              )}
            </Button>
          </div>
        </div>

        {outputContent && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Export Options</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Undo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo"
                >
                  <ArrowRight className="h-4 w-4 mr-1" /> Redo
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export as" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word</SelectItem>
                  <SelectItem value="txt">Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => handleExport(exportFormat)}
                disabled={isExporting || !outputContent}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export as {exportFormat.toUpperCase()}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setInputContent(outputContent);
                  setOutputContent('');
                }}
                disabled={!outputContent}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Use as New Input
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-slate-400">
              <p>Press <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">Ctrl+Enter</kbd> to transform, or use voice commands:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>"Transform content"</li>
                <li>"Copy to clipboard"</li>
                <li>"Export as PDF"</li>
                <li>"Undo" or "Redo" changes</li>
                <li>"Clear all" to start over</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Hidden div for PDF export */}
        <div className="hidden">
          <div ref={exportRef} className="p-8">
            <h2 className="text-2xl font-bold mb-2">AI Content Transform</h2>
            <p className="text-slate-500 mb-6">Generated on {new Date().toLocaleDateString()}</p>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Original Content</h3>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
                {inputContent || 'No input content'}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {transformOptions.find(t => t.id === selectedTransform)?.name} ({tone} Tone)
              </h3>
              <div className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                {outputContent || 'No output content'}
              </div>
            </div>
            
            <div className="text-xs text-slate-500 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p>Generated by Momentum AI • {window.location.hostname}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentTransform;
