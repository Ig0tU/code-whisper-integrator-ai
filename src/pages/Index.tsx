import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, FileCode, Link, Upload } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import { GeminiService, geminiApiStorage } from '@/services/geminiService';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string>('');
  const [generalAnalysis, setGeneralAnalysis] = useState<string>('');
  const [strategicOpportunities, setStrategicOpportunities] = useState<string>('');
  const [criticalRisks, setCriticalRisks] = useState<string>('');
  const [codeInput, setCodeInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedGeminiModel, setSelectedGeminiModel] = useState("");

  useEffect(() => {
    const fetchAvailableModels = async () => {
      const apiKey = geminiApiStorage.getApiKey();
      if (apiKey) {
        try {
          const geminiService = new GeminiService(apiKey);
          const models = await geminiService.getAvailableModels();
          if (models && models.length > 0) {
            setSelectedGeminiModel(models[0].id);
          }
        } catch (error) {
          console.error("Error fetching Gemini models:", error);
        }
      }
    };
    
    fetchAvailableModels();
  }, []);

  useEffect(() => {
    if (analysisResults) {
      const generalMatch = analysisResults.match(/## General Analysis
([\s\S]*?)(?=## Strategic Opportunities|## Critical Risks|$)/);
      const opportunitiesMatch = analysisResults.match(/## Strategic Opportunities
([\s\S]*?)(?=## Critical Risks|$)/);
      const risksMatch = analysisResults.match(/## Critical Risks
([\s\S]*)/);

      setGeneralAnalysis(generalMatch && generalMatch[1] ? generalMatch[1].trim() : 'Not available.');
      setStrategicOpportunities(opportunitiesMatch && opportunitiesMatch[1] ? opportunitiesMatch[1].trim() : 'Not available.');
      setCriticalRisks(risksMatch && risksMatch[1] ? risksMatch[1].trim() : 'Not available.');
    } else {
      setGeneralAnalysis('');
      setStrategicOpportunities('');
      setCriticalRisks('');
    }
  }, [analysisResults]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const analyzeCode = async (code: string) => {
    const geminiApiKey = geminiApiStorage.getApiKey();
    
    if (!geminiApiKey) {
      toast.error("Please add your Google Gemini API key in settings");
      setIsProcessing(false);
      return;
    }

    try {
      const geminiService = new GeminiService(geminiApiKey);
      let modelToUse = selectedGeminiModel;
      
      if (!modelToUse) {
        const availableModels = await geminiService.getAvailableModels();
        if (availableModels.length > 0) {
          modelToUse = availableModels[0].id;
          setSelectedGeminiModel(modelToUse);
        } else {
          modelToUse = "gemini-1.5-pro";
        }
      }
      
      console.log(`Analyzing code with model: ${modelToUse}`);
      
      try {
        const analysis = await geminiService.generateCompletion({
          model: modelToUse,
          prompt: `Analyze the following code. Provide a detailed analysis covering these aspects:

## General Analysis
1.  **Main Components & Functions:** Describe the primary parts of the code and their roles.
2.  **Language & Framework:** Identify the programming language(s) and any frameworks/libraries used.
3.  **Key Integration Points:** Highlight areas where this code interacts with other systems, modules, or services.
4.  **Potential Issues or General Improvements:** List any general issues, areas for refactoring, or minor improvements.

## Strategic Opportunities
Based on the code's functionality and structure, identify and describe 2-3 top strategic opportunities. Focus on:
*   **Novel AI Integration:** How could AI (e.g., Gemini models, machine learning) be integrated to create significant new value, enhance capabilities, or solve complex problems uniquely? Provide specific examples.
*   **High-Impact Enhancements:** What architectural changes or feature additions could provide substantial benefits (e.g., scalability, new revenue streams, significant user experience improvement)?

## Critical Risks
Identify and describe 2-3 top critical risks present in the code. Focus on:
*   **Security Vulnerabilities:** Any weaknesses that could be exploited.
*   **Major Architectural Flaws:** Fundamental design problems that could hinder scalability, maintainability, or reliability.
*   **Performance Bottlenecks:** Specific areas that are likely to cause significant performance issues.
*   **Data Integrity Issues:** Potential risks to the correctness and consistency of data.

For each risk, explain why it's critical and suggest the potential consequences if not addressed.

Please ensure the output is clearly structured with Markdown headings (e.g., "## General Analysis", "## Strategic Opportunities", "## Critical Risks").
`,
          maxTokens: 2048,
          temperature: 0.2
        });
        
        setAnalysisResults(analysis);
        setAnalysisComplete(true);
      } catch (error) {
        console.error(`Error with model ${modelToUse}, trying fallback:`, error);
        
        const availableModels = await geminiService.getAvailableModels();
        if (availableModels.length > 1) {
          const fallbackModel = availableModels.find(m => m.id !== modelToUse)?.id || availableModels[0].id;
          console.log(`Falling back to model: ${fallbackModel}`);
          
          const analysis = await geminiService.generateCompletion({
            model: fallbackModel,
            prompt: `Analyze the following code. Provide a detailed analysis covering these aspects:

## General Analysis
1.  **Main Components & Functions:** Describe the primary parts of the code and their roles.
2.  **Language & Framework:** Identify the programming language(s) and any frameworks/libraries used.
3.  **Key Integration Points:** Highlight areas where this code interacts with other systems, modules, or services.
4.  **Potential Issues or General Improvements:** List any general issues, areas for refactoring, or minor improvements.

## Strategic Opportunities
Based on the code's functionality and structure, identify and describe 2-3 top strategic opportunities. Focus on:
*   **Novel AI Integration:** How could AI (e.g., Gemini models, machine learning) be integrated to create significant new value, enhance capabilities, or solve complex problems uniquely? Provide specific examples.
*   **High-Impact Enhancements:** What architectural changes or feature additions could provide substantial benefits (e.g., scalability, new revenue streams, significant user experience improvement)?

## Critical Risks
Identify and describe 2-3 top critical risks present in the code. Focus on:
*   **Security Vulnerabilities:** Any weaknesses that could be exploited.
*   **Major Architectural Flaws:** Fundamental design problems that could hinder scalability, maintainability, or reliability.
*   **Performance Bottlenecks:** Specific areas that are likely to cause significant performance issues.
*   **Data Integrity Issues:** Potential risks to the correctness and consistency of data.

For each risk, explain why it's critical and suggest the potential consequences if not addressed.

Please ensure the output is clearly structured with Markdown headings (e.g., "## General Analysis", "## Strategic Opportunities", "## Critical Risks").
`,
            maxTokens: 2048,
            temperature: 0.2
          });
          
          setAnalysisResults(analysis);
          setAnalysisComplete(true);
          
          setSelectedGeminiModel(fallbackModel);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error analyzing code with Gemini:", error);
      toast.error("Failed to analyze code. Please check your API key and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      if (activeTab === 'upload' && selectedFiles.length > 0) {
        const fileContents = await Promise.all(
          selectedFiles.map(file => readFileAsText(file))
        );
        await analyzeCode(fileContents.join('\n\n--- Next File ---\n\n'));
      } 
      else if (activeTab === 'url' && repoUrl) {
        await analyzeCode(`Repository URL: ${repoUrl}`);
      } 
      else if (activeTab === 'paste' && codeInput) {
        await analyzeCode(codeInput);
      }
      else {
        toast.error("Please provide content to analyze");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error processing submission:", error);
      toast.error("An error occurred while processing your request");
      setIsProcessing(false);
    }
  };

  const browseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm mb-2">
                        {selectedFiles.length > 0 
                          ? `Selected ${selectedFiles.length} file(s)` 
                          : 'Drag & drop files or folders here'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Support for .zip, folder upload, and individual files
                      </p>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={browseFiles}>
                        Browse Files
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing || selectedFiles.length === 0}
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
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: https://github.com/username/repo, https://huggingface.co/spaces/username/project
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing || !repoUrl}
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
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing || !codeInput}
                    >
                      {isProcessing ? 'Processing...' : 'Analyze Code'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="file">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border rounded-lg p-4 min-h-[200px] bg-muted/30">
                      {selectedFiles.length > 0 ? (
                        <ul className="text-sm">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="mb-1 flex items-center">
                              <FileCode className="h-4 w-4 mr-2" />
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          File explorer will appear here once files are uploaded
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing || selectedFiles.length === 0}
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
                  Detailed insights from AI analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generalAnalysis && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">General Analysis</h3>
                    <div className="rounded-md bg-muted p-3 whitespace-pre-wrap font-mono text-sm">
                      {generalAnalysis}
                    </div>
                  </div>
                )}
                {strategicOpportunities && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-green-600">Strategic Opportunities</h3>
                    <div className="rounded-md bg-muted p-3 whitespace-pre-wrap font-mono text-sm">
                      {strategicOpportunities}
                    </div>
                  </div>
                )}
                {criticalRisks && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Critical Risks</h3>
                    <div className="rounded-md bg-muted p-3 whitespace-pre-wrap font-mono text-sm">
                      {criticalRisks}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  Ready to start interacting with your code through the AI chat.
                </p>
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
