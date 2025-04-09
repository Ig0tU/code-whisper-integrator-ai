
import React, { useState } from 'react';
import { Send, Mic, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsPanel from './SettingsPanel';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    const newMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Simulate a response from the AI (replace with actual implementation)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: `I've processed your request: "${inputValue}"`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement actual voice recording functionality
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">Agentegrator Chat</h2>
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

      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No messages yet. Start by sending a message or configuring your integration settings.
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
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
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
        />
        <div className="flex flex-col gap-2">
          <Button
            size="icon" 
            variant={isRecording ? "destructive" : "secondary"}
            onClick={toggleRecording}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ''}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
