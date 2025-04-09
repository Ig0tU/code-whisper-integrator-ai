import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";

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

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    // Here you would load the specific settings for the selected preset
  };

  const handleCustomPromptSave = () => {
    // Save custom prompt logic
  };

  return (
    <Tabs defaultValue="presets" className="w-full mt-6">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="presets">Presets</TabsTrigger>
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
        <TabsTrigger value="prompts">Prompts</TabsTrigger>
      </TabsList>
      
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
