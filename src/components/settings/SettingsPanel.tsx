
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiSettings from './ApiSettings';
import PresetsPanel from './PresetsPanel';
import ParametersPanel from './ParametersPanel';
import PromptsPanel from './PromptsPanel';

const SettingsPanel: React.FC = () => {
  const [selectedGeminiModel, setSelectedGeminiModel] = useState('gemini-pro');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [autoSave, setAutoSave] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [activePrompt, setActivePrompt] = useState('default');

  return (
    <Tabs defaultValue="api" className="w-full mt-6">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="api">API Settings</TabsTrigger>
        <TabsTrigger value="presets">Presets</TabsTrigger>
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
        <TabsTrigger value="prompts">Prompts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="api">
        <ApiSettings 
          selectedGeminiModel={selectedGeminiModel}
          setSelectedGeminiModel={setSelectedGeminiModel}
        />
      </TabsContent>
      
      <TabsContent value="presets">
        <PresetsPanel 
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          setTemperature={setTemperature}
          setSelectedGeminiModel={setSelectedGeminiModel}
        />
      </TabsContent>
      
      <TabsContent value="parameters">
        <ParametersPanel 
          temperature={temperature}
          setTemperature={setTemperature}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          autoSave={autoSave}
          setAutoSave={setAutoSave}
          autoAnalyze={autoAnalyze}
          setAutoAnalyze={setAutoAnalyze}
        />
      </TabsContent>
      
      <TabsContent value="prompts">
        <PromptsPanel 
          activePrompt={activePrompt}
          setActivePrompt={setActivePrompt}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsPanel;
