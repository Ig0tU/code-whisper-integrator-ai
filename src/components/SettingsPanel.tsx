
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Info, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { HUGGINGFACE_MODELS, huggingFaceApiStorage, HuggingFaceService } from '@/services/huggingfaceService';
import { GEMINI_MODELS, geminiApiStorage, GeminiService } from '@/services/geminiService';
import { toast } from 'sonner';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const languagePresets = [
  { id: 'react', name: 'React', category: 'frontend', color: 'bg-blue-500' },
  { id: 'vue', name: 'Vue.js', category: 'frontend', color: 'bg-green-500' },
  { id: 'angular', name: 'Angular', category: 'frontend', color: 'bg-red-500' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', color: 'bg-teal-500' },
  { id: 'node', name: 'Node.js', category: 'backend', color: 'bg-green-700' },
  { id: 'python', name: 'Python', category: 'backend', color: 'bg-blue-700' },
  { id: 'django', name: 'Django', category: 'backend', color: 'bg-indigo-700' },
  { id: 'php', name: 'PHP', category: 'backend', color: 'bg-purple-700' },
  { id: 'laravel', name: 'Laravel', category: 'backend', color: 'bg-red-700' },
  { id: 'joomla', name: 'Joomla/YooTheme', category: 'cms', color: 'bg-orange-500' },
  { id: 'wordpress', name: 'WordPress', category: 'cms', color: 'bg-blue-600' },
  { id: 'gradio', name: 'Gradio', category: 'ai', color: 'bg-violet-600' },
  { id: 'streamlit', name: 'Streamlit', category: 'ai', color: 'bg-red-600' },
  { id: 'solidity', name: 'Solidity', category: 'blockchain', color: 'bg-gray-700' },
  { id: 'rust', name: 'Rust', category: 'systems', color: 'bg-orange-700' },
  { id: 'go', name: 'Go', category: 'systems', color: 'bg-blue-400' },
];

const groupedPresets = languagePresets.reduce((acc, preset) => {
  acc[preset.category] = acc[preset.category] || [];
  acc[preset.category].push(preset);
  return acc;
}, {} as Record<string, typeof languagePresets>);

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  cms: 'CMS',
  ai: 'AI & ML',
  blockchain: 'Blockchain',
  systems: 'Systems'
};

const SettingsPanel: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [autoSave, setAutoSave] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [activePrompt, setActivePrompt] = useState('default');
  
  // API keys state
  const [hfApiKey, setHfApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showHfApiKey, setShowHfApiKey] = useState(false);
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  
  // API key validation state
  const [hfKeyStatus, setHfKeyStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  
  // Model selection state
  const [selectedHfModel, setSelectedHfModel] = useState(HUGGINGFACE_MODELS[0].id);
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(GEMINI_MODELS[0].id);

  useEffect(() => {
    // Load saved API keys on component mount
    const storedHfApiKey = huggingFaceApiStorage.getApiKey();
    if (storedHfApiKey) {
      setHfApiKey(storedHfApiKey);
      validateHfApiKey(storedHfApiKey);
    }
    
    const storedGeminiApiKey = geminiApiStorage.getApiKey();
    if (storedGeminiApiKey) {
      setGeminiApiKey(storedGeminiApiKey);
      validateGeminiApiKey(storedGeminiApiKey);
    }
  }, []);

  const validateHfApiKey = async (key: string) => {
    if (!key.trim()) {
      setHfKeyStatus('idle');
      return;
    }
    
    setHfKeyStatus('validating');
    try {
      const hfService = new HuggingFaceService(key);
      // Simple test prompt to validate the API key
      await hfService.generateCompletion({
        model: "gpt2",
        prompt: "Hello, this is a test.",
        max_tokens: 5
      });
      setHfKeyStatus('valid');
    } catch (error) {
      console.error("HuggingFace API key validation failed:", error);
      setHfKeyStatus('invalid');
    }
  };

  const validateGeminiApiKey = async (key: string) => {
    if (!key.trim()) {
      setGeminiKeyStatus('idle');
      return;
    }
    
    setGeminiKeyStatus('validating');
    try {
      const geminiService = new GeminiService(key);
      // Simple test prompt to validate the API key
      await geminiService.generateCompletion({
        model: "gemini-pro",
        prompt: "Hello, this is a test."
      });
      setGeminiKeyStatus('valid');
    } catch (error) {
      console.error("Gemini API key validation failed:", error);
      setGeminiKeyStatus('invalid');
    }
  };

  const handleHfApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setHfApiKey(newKey);
    // Reset validation status when user is typing
    setHfKeyStatus('idle');
  };

  const handleGeminiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setGeminiApiKey(newKey);
    // Reset validation status when user is typing
    setGeminiKeyStatus('idle');
  };

  const handleHfApiKeyBlur = () => {
    validateHfApiKey(hfApiKey);
  };

  const handleGeminiApiKeyBlur = () => {
    validateGeminiApiKey(geminiApiKey);
  };

  const handleApiKeySave = () => {
    let hasValidKey = false;
    
    if (hfApiKey.trim()) {
      huggingFaceApiStorage.setApiKey(hfApiKey.trim());
      validateHfApiKey(hfApiKey.trim());
      hasValidKey = true;
    }
    
    if (geminiApiKey.trim()) {
      geminiApiStorage.setApiKey(geminiApiKey.trim());
      validateGeminiApiKey(geminiApiKey.trim());
      hasValidKey = true;
    }
    
    if (hasValidKey) {
      toast.success("API key(s) saved successfully!");
    } else {
      toast.error("Please enter at least one valid API key");
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    
    // Apply preset-specific settings
    // These could be adjusted based on the selected preset
    switch (presetId) {
      case 'react':
      case 'vue':
      case 'angular':
        setTemperature(0.5); // Lower temperature for more precise frontend code
        setSelectedGeminiModel("gemini-pro");
        break;
      case 'python':
      case 'django':
      case 'node':
        setTemperature(0.6); // Balanced for backend code
        setSelectedGeminiModel("gemini-pro");
        break;
      case 'gradio':
      case 'streamlit':
        setTemperature(0.7); // More creativity for AI apps
        setSelectedGeminiModel("gemini-pro-vision"); // Vision model for AI applications
        break;
      default:
        setTemperature(0.7); // Default temperature
        setSelectedGeminiModel("gemini-pro");
    }
  };

  const handleCustomPromptSave = () => {
    // Save custom prompt logic
    toast.success("Custom prompt saved");
  };

  const getStatusIcon = (status: 'idle' | 'validating' | 'valid' | 'invalid') => {
    switch (status) {
      case 'validating':
        return <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />;
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Tabs defaultValue="api" className="w-full mt-6">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="api">API Settings</TabsTrigger>
        <TabsTrigger value="presets">Presets</TabsTrigger>
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
        <TabsTrigger value="prompts">Prompts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="api" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI API Configuration</CardTitle>
            <CardDescription>
              Configure your API keys for Google Gemini and Hugging Face
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Google Gemini API Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Google Gemini (Recommended)</h3>
                <div className="space-y-2">
                  <Label htmlFor="gemini-api-key" className="flex items-center">
                    Gemini API Key
                    {geminiKeyStatus !== 'idle' && (
                      <span className="ml-2">{getStatusIcon(geminiKeyStatus)}</span>
                    )}
                  </Label>
                  <div className="flex">
                    <Input
                      id="gemini-api-key"
                      type={showGeminiApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={handleGeminiApiKeyChange}
                      onBlur={handleGeminiApiKeyBlur}
                      placeholder="Enter your Google Gemini API key"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                      className="ml-2"
                    >
                      {showGeminiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {geminiKeyStatus === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1">
                      Invalid API key. Please check and try again.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gemini-model-select">Gemini Model</Label>
                  <Select value={selectedGeminiModel} onValueChange={setSelectedGeminiModel}>
                    <SelectTrigger id="gemini-model-select">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {GEMINI_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                {/* Hugging Face API Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hugging Face (Optional)</h3>
                  <div className="space-y-2">
                    <Label htmlFor="hf-api-key" className="flex items-center">
                      HuggingFace API Key
                      {hfKeyStatus !== 'idle' && (
                        <span className="ml-2">{getStatusIcon(hfKeyStatus)}</span>
                      )}
                    </Label>
                    <div className="flex">
                      <Input
                        id="hf-api-key"
                        type={showHfApiKey ? "text" : "password"}
                        value={hfApiKey}
                        onChange={handleHfApiKeyChange}
                        onBlur={handleHfApiKeyBlur}
                        placeholder="Enter your Hugging Face API key"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowHfApiKey(!showHfApiKey)}
                        className="ml-2"
                      >
                        {showHfApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {hfKeyStatus === 'invalid' && (
                      <p className="text-xs text-red-500 mt-1">
                        Invalid API key. Please check and try again.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hf-model-select">HuggingFace Model</Label>
                    <Select value={selectedHfModel} onValueChange={setSelectedHfModel}>
                      <SelectTrigger id="hf-model-select">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {HUGGINGFACE_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-4">
                  Your API keys are stored locally in your browser and never sent to our servers.
                  We recommend using Google Gemini for the best experience.
                </p>
                <Button onClick={handleApiKeySave} className="w-full">
                  Save API Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="presets" className="space-y-4">
        <div className="space-y-4">
          {Object.entries(groupedPresets).map(([category, presets]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={selectedPreset === preset.id ? "default" : "outline"}
                    className="justify-start h-auto py-2"
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${preset.color}`}></div>
                    <span>{preset.name}</span>
                    {selectedPreset === preset.id && <Check className="w-4 h-4 ml-auto" />}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedPreset && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle>Selected Preset: {languagePresets.find(p => p.id === selectedPreset)?.name}</CardTitle>
              <CardDescription>
                Optimized settings for this language/framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Auto-detect code structure</Label>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Apply recommended linting rules</Label>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Follow framework conventions</Label>
                  <Switch checked={true} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="parameters" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">
                Temperature
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 inline text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Controls randomness: Lower values make output more deterministic,
                        higher values more creative.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-sm text-muted-foreground">{temperature.toFixed(2)}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.01}
              value={[temperature]}
              onValueChange={([value]) => setTemperature(value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-tokens">
                Max Tokens
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 inline text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Maximum length of generated responses.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-sm text-muted-foreground">{maxTokens}</span>
            </div>
            <Slider
              id="max-tokens"
              min={256}
              max={8192}
              step={256}
              value={[maxTokens]}
              onValueChange={([value]) => setMaxTokens(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select defaultValue="gpt-4">
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                <SelectItem value="llama-3">Llama 3</SelectItem>
                <SelectItem value="custom">Custom Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="auto-save">Auto-save changes</Label>
            <Switch 
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-analyze">Auto-analyze uploads</Label>
            <Switch 
              id="auto-analyze"
              checked={autoAnalyze}
              onCheckedChange={setAutoAnalyze}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="prompts" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="active-prompt">Active Prompt Template</Label>
            <Select 
              value={activePrompt}
              onValueChange={setActivePrompt}
            >
              <SelectTrigger id="active-prompt">
                <SelectValue placeholder="Select prompt template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Integration</SelectItem>
                <SelectItem value="explain">Code Explainer</SelectItem>
                <SelectItem value="refactor">Code Refactoring</SelectItem>
                <SelectItem value="optimize">Performance Optimization</SelectItem>
                <SelectItem value="security">Security Audit</SelectItem>
                <SelectItem value="custom">Custom Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {activePrompt === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Prompt Template</Label>
              <Textarea 
                id="custom-prompt"
                placeholder="Enter your custom system prompt here..."
                className="min-h-[200px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleCustomPromptSave}>
                  Save Template
                </Button>
              </div>
            </div>
          )}
          
          {activePrompt !== 'custom' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Template Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {activePrompt === 'default' && "You are an AI code assistant integrated into the codebase. Analyze the code structure and respond to user queries, helping them understand and modify the code."}
                  {activePrompt === 'explain' && "Analyze the provided code and explain its functionality in clear, simple terms. Identify key components, patterns and how they interact."}
                  {activePrompt === 'refactor' && "Examine the code and suggest refactoring opportunities to improve readability, maintainability and performance while preserving functionality."}
                  {activePrompt === 'optimize' && "Identify performance bottlenecks in the code and suggest optimizations to improve execution speed, memory usage, and overall efficiency."}
                  {activePrompt === 'security' && "Perform a security audit of the code. Identify potential vulnerabilities, injection points, and suggest security best practices."}
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <Label>Available Variables</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">$LANGUAGE</Badge>
              <Badge variant="outline">$FRAMEWORK</Badge>
              <Badge variant="outline">$CODEBASE_SUMMARY</Badge>
              <Badge variant="outline">$PROJECT_STRUCTURE</Badge>
              <Badge variant="outline">$FILE_COUNT</Badge>
              <Badge variant="outline">$USER_OBJECTIVE</Badge>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsPanel;
