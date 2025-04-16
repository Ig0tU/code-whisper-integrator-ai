
import React from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParametersPanelProps {
  temperature: number;
  setTemperature: (temperature: number) => void;
  maxTokens: number;
  setMaxTokens: (maxTokens: number) => void;
  autoSave: boolean;
  setAutoSave: (autoSave: boolean) => void;
  autoAnalyze: boolean;
  setAutoAnalyze: (autoAnalyze: boolean) => void;
}

const ParametersPanel: React.FC<ParametersPanelProps> = ({
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  autoSave,
  setAutoSave,
  autoAnalyze,
  setAutoAnalyze
}) => {
  return (
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
  );
};

export default ParametersPanel;
