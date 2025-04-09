
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SettingsPanel from './SettingsPanel';
import { HuggingFaceService, huggingFaceApiStorage } from '@/services/huggingfaceService';
import { GeminiService, geminiApiStorage, GEMINI_MODELS } from '@/services/geminiService';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].id);
  
  // Check for API key on mount
  useEffect(() => {
    const apiKey = geminiApiStorage.getApiKey();
    setApiKeyMissing(!apiKey);
    
    // Set up event listener for model changes
    const handleModelChange = (event: CustomEvent) => {
      if (event.detail && event.detail.model) {
        setSelectedModel(event.detail.model);
      }
    };
    
    window.addEventListener('modelChanged' as any, handleModelChange);
    
    return () => {
      window.removeEventListener('modelChanged' as any, handleModelChange);
    };
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    const apiKey = geminiApiStorage.getApiKey();
    if (!apiKey) {
      toast.error("Please add your Google Gemini API key in settings");
      setApiKeyMissing(true);
      return;
    }
    
    const newMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(messages => [...messages, newMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      console.log(`Sending message using Gemini model: ${selectedModel}`);
      const geminiService = new GeminiService(apiKey);
      
      // Make a real API call to Gemini
      const response = await geminiService.generateCompletion({
        model: selectedModel,
        prompt: inputValue,
        maxTokens: 1024,
        temperature: 0.7
      });
      
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    // Real voice recording functionality would go here
    toast.info("Voice recording not implemented yet");
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">Agentegrator Chat (Gemini)</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Chat & Integration Settings</SheetTitle>
            </SheetHeader>
            <SettingsPanel />
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {apiKeyMissing && (
          <Alert className="mb-4">
            <AlertDescription>
              Please configure your Google Gemini API key in settings to use the chat functionality.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No messages yet. Start by sending a message or configuring your Hugging Face API key in settings.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted text-foreground">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex items-end gap-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message or instructions..."
          className="min-h-[80px] resize-none"
          disabled={isProcessing}
        />
        <div className="flex flex-col gap-2">
          <Button
            size="icon" 
            variant={isRecording ? "destructive" : "secondary"}
            onClick={toggleRecording}
            title={isRecording ? "Stop recording" : "Start voice recording"}
            disabled={isProcessing}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isProcessing}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
