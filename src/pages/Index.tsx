
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, FileCode, Link, Upload } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Agentegrator</h1>
        <p className="text-muted-foreground">
          Upload code, understand it, and integrate AI throughout your codebase
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Your Code</CardTitle>
              <CardDescription>
                Provide your code through one of the available methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="upload" className="flex flex-col items-center px-2 py-1">
                    <Upload className="h-4 w-4 mb-1" />
                    <span className="text-xs">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex flex-col items-center px-2 py-1">
                    <Link className="h-4 w-4 mb-1" />
                    <span className="text-xs">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="flex flex-col items-center px-2 py-1">
                    <Code className="h-4 w-4 mb-1" />
                    <span className="text-xs">Paste</span>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex flex-col items-center px-2 py-1">
                    <FileCode className="h-4 w-4 mb-1" />
                    <span className="text-xs">File Tree</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm mb-2">Drag & drop files or folders here</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Support for .zip, folder upload, and individual files
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Browse Files
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Upload & Analyze'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="url">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Enter GitHub, HuggingFace, or repository URL" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: https://github.com/username/repo, https://huggingface.co/spaces/username/project
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Fetch & Analyze'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="paste">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea 
                      placeholder="Paste your code here"
                      className="min-h-[200px]"
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Analyze Code'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="file">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border rounded-lg p-4 min-h-[200px] bg-muted/30">
                      <p className="text-sm text-muted-foreground text-center">
                        File explorer will appear here once files are uploaded
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Analyze Structure'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {analysisComplete && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Code structure and integration points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-mono">
                      <span className="text-green-500">✓</span> Detected framework: React + Vite
                    </p>
                    <p className="text-sm font-mono">
                      <span className="text-green-500">✓</span> Found 12 integration points
                    </p>
                    <p className="text-sm font-mono">
                      <span className="text-green-500">✓</span> Main entry points identified
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ready to start interacting with your code through the AI chat.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="h-[600px]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Index;
