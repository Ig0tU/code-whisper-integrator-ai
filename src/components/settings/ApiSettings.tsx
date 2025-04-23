
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GEMINI_MODELS, geminiApiStorage, GeminiService, GeminiModelOption } from '@/services/geminiService';
import { toast } from 'sonner';

interface ApiSettingsProps {
  selectedGeminiModel: string;
  setSelectedGeminiModel: (model: string) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({
  selectedGeminiModel,
  setSelectedGeminiModel
}) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [availableModels, setAvailableModels] = useState<GeminiModelOption[]>(GEMINI_MODELS);
  
  useEffect(() => {
    const storedGeminiApiKey = geminiApiStorage.getApiKey();
    if (storedGeminiApiKey) {
      setGeminiApiKey(storedGeminiApiKey);
      validateGeminiApiKey(storedGeminiApiKey);
      fetchAvailableModels(storedGeminiApiKey);
    }
  }, []);

  const fetchAvailableModels = async (key: string) => {
    if (!key.trim()) return;
    
    try {
      const geminiService = new GeminiService(key);
      const models = await geminiService.getAvailableModels();
      console.log("Available Gemini models:", models);
      
      if (models && models.length > 0) {
        setAvailableModels(models);
        
        // If current selected model is not in the list, select the first available one
        if (!models.some(model => model.id === selectedGeminiModel)) {
          setSelectedGeminiModel(models[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching available Gemini models:", error);
    }
  };

  const validateGeminiApiKey = async (key: string) => {
    if (!key.trim()) {
      setGeminiKeyStatus('idle');
      return;
    }
    
    setGeminiKeyStatus('validating');
    console.log("Validating Gemini API key");
    
    try {
      const geminiService = new GeminiService(key);
      const isValid = await geminiService.validateApiKey();
      console.log("Gemini API key validation result:", isValid);
      
      setGeminiKeyStatus(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        geminiApiStorage.setApiKey(key.trim());
        console.log("Gemini API key validated and saved");
        toast.success("Gemini API key validated successfully");
        fetchAvailableModels(key);
      } else {
        toast.error("Invalid Gemini API key");
      }
    } catch (error) {
      console.error("Gemini API key validation failed:", error);
      setGeminiKeyStatus('invalid');
      toast.error("Error validating Gemini API key");
    }
  };

  const handleGeminiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setGeminiApiKey(newKey);
    setGeminiKeyStatus('idle');
  };

  const handleGeminiApiKeyBlur = () => {
    validateGeminiApiKey(geminiApiKey);
  };

  const handleApiKeySave = () => {
    if (geminiApiKey.trim()) {
      geminiApiStorage.setApiKey(geminiApiKey.trim());
      validateGeminiApiKey(geminiApiKey.trim());
    } else {
      toast.error("Please enter a valid Gemini API key");
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Google Gemini API Configuration</CardTitle>
        <CardDescription>
          Configure your API key for Google Gemini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
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
              <p className="text-xs text-muted-foreground mt-2">
                Get your Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-500 hover:underline">Google AI Studio</a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gemini-model-select">Gemini Model</Label>
              <Select value={selectedGeminiModel} onValueChange={setSelectedGeminiModel}>
                <SelectTrigger id="gemini-model-select">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
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
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-4">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
            <Button onClick={handleApiKeySave} className="w-full">
              Save API Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSettings;
