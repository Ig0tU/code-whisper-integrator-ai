
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface PromptsPanelProps {
  activePrompt: string;
  setActivePrompt: (prompt: string) => void;
}

const PromptsPanel: React.FC<PromptsPanelProps> = ({
  activePrompt,
  setActivePrompt
}) => {
  const handleCustomPromptSave = () => {
    // Save custom prompt logic
    toast.success("Custom prompt saved");
  };

  return (
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
  );
};

export default PromptsPanel;
