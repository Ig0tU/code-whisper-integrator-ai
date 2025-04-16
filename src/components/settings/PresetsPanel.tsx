
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check } from 'lucide-react';

interface LanguagePreset {
  id: string;
  name: string;
  category: string;
  color: string;
}

const languagePresets: LanguagePreset[] = [
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

interface PresetsPanelProps {
  selectedPreset: string | null;
  setSelectedPreset: (presetId: string) => void;
  setTemperature: (temperature: number) => void;
  setSelectedGeminiModel: (model: string) => void;
}

const PresetsPanel: React.FC<PresetsPanelProps> = ({
  selectedPreset,
  setSelectedPreset,
  setTemperature,
  setSelectedGeminiModel
}) => {
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    
    // Apply preset-specific settings
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

  return (
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
    </div>
  );
};

export default PresetsPanel;
