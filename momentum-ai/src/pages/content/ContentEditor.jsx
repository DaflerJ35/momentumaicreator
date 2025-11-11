import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Video, 
  Code, 
  FileText, 
  Type, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Undo2,
  Redo2,
  Eye,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { sanitizeHTML } from '../../utils/sanitize';

const ContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);

  // Load content if editing existing document
  useEffect(() => {
    if (id) {
      // TODO: Fetch document content from API
      setTitle('My Awesome Blog Post');
      setContent('# Welcome to Momentum AI\n\nStart writing your content here...');
    }
    updateWordCount(content);
  }, [id, content]);

  const updateWordCount = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateWordCount(newContent);
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to save content');
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const formatText = (command, value = '') => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 bg-transparent"
                placeholder="Enter title..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-4 py-2">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('createLink', prompt('Enter URL:'))}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => formatText('formatBlock', '<blockquote>')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <Button variant="ghost" size="sm" title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Insert Video">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Insert Code">
            <Code className="h-4 w-4" />
          </Button>
          <div className="flex-1"></div>
          <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
            {wordCount} words • {charCount} characters
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs 
          defaultValue="write" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="rounded-none border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="flex-1 overflow-auto p-6">
            <Textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              className="w-full h-full min-h-[calc(100vh-250px)] p-6 text-lg border-0 focus-visible:ring-0 resize-none"
              placeholder="Start writing your content here..."
            />
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 overflow-auto p-6">
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Document Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <Input 
                      type="text" 
                      placeholder="document-slug" 
                      className="max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="flex h-10 w-full max-w-md rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                    <Input 
                      type="text" 
                      placeholder="SEO Title" 
                      className="max-w-md"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <Textarea 
                      placeholder="A brief description of the page" 
                      className="max-w-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentEditor;
