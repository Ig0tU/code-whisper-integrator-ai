
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { HUGGINGFACE_MODELS, huggingFaceApiStorage, HuggingFaceService } from '@/services/huggingfaceService';
import { GEMINI_MODELS, geminiApiStorage, GeminiService } from '@/services/geminiService';
import { toast } from 'sonner';

interface ApiSettingsProps {
  selectedHfModel: string;
  setSelectedHfModel: (model: string) => void;
  selectedGeminiModel: string;
  setSelectedGeminiModel: (model: string) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({
  selectedHfModel,
  setSelectedHfModel,
  selectedGeminiModel,
  setSelectedGeminiModel
}) => {
  // API keys state
  const [hfApiKey, setHfApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showHfApiKey, setShowHfApiKey] = useState(false);
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  
  // API key validation state
  const [hfKeyStatus, setHfKeyStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  
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
      const isValid = await hfService.validateApiKey();
      setHfKeyStatus(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        // Immediately save valid key to storage
        huggingFaceApiStorage.setApiKey(key.trim());
        console.log("Hugging Face API key validated and saved");
      }
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
      const isValid = await geminiService.validateApiKey();
      setGeminiKeyStatus(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        // Immediately save valid key to storage
        geminiApiStorage.setApiKey(key.trim());
        console.log("Gemini API key validated and saved");
      }
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
  );
};

export default ApiSettings;
