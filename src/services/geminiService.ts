
import { toast } from "sonner";

export interface GeminiModelOption {
  id: string;
  name: string;
  description: string;
}

// Updated models based on the actual available models from the API
export const GEMINI_MODELS: GeminiModelOption[] = [
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Stable version with 2 million token support" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast and versatile multimodal model" },
  { id: "gemini-pro-vision", name: "Gemini 1.0 Pro Vision", description: "Optimized for image understanding" },
  { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash-8B", description: "Cost effective smaller flash model" },
];

export interface GeminiCompletionParams {
  prompt: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(params: GeminiCompletionParams): Promise<string> {
    try {
      const { model, prompt, maxTokens = 1024, temperature = 0.7, topP = 0.95, topK = 40, stopSequences = [] } = params;
      
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
      
      console.log(`Generating completion with Gemini model: ${model}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature,
            topP,
            topK,
            maxOutputTokens: maxTokens,
            stopSequences
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Gemini API error:", errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 && 
          result.candidates[0].content && 
          result.candidates[0].content.parts && 
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.log("Unexpected Gemini response format:", result);
        return "No response generated. Please try again.";
      }
    } catch (error) {
      console.error("Error generating completion with Gemini:", error);
      toast.error("Error generating text with Gemini. Please check your API key and try again.");
      throw error;
    }
  }

  async getAvailableModels(): Promise<GeminiModelOption[]> {
    try {
      if (!this.apiKey || this.apiKey.trim() === "") {
        console.log("Gemini API key is empty");
        return GEMINI_MODELS; // Return default models if no API key
      }
      
      const url = `${this.baseUrl}/models?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error("Failed to fetch Gemini models:", response.status);
        return GEMINI_MODELS;
      }
      
      const data = await response.json();
      const filteredModels: GeminiModelOption[] = [];
      
      if (data.models && Array.isArray(data.models)) {
        // Filter models that support generateContent
        data.models.forEach((model: any) => {
          if (model.name && 
              model.supportedGenerationMethods && 
              model.supportedGenerationMethods.includes("generateContent")) {
            const modelName = model.name.replace("models/", "");
            // Only add recognized models to avoid duplicates
            if (modelName.startsWith("gemini-")) {
              filteredModels.push({
                id: modelName,
                name: model.displayName || modelName,
                description: model.description || ""
              });
            }
          }
        });
      }
      
      return filteredModels.length > 0 ? filteredModels : GEMINI_MODELS;
    } catch (error) {
      console.error("Error fetching Gemini models:", error);
      return GEMINI_MODELS;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey.trim() === "") {
        console.log("Gemini API key is empty");
        return false;
      }
      
      const testUrl = `${this.baseUrl}/models?key=${this.apiKey}`;
      
      console.log("Validating Gemini API key...");
      
      const response = await fetch(testUrl);
      
      if (!response.ok) {
        console.error("Gemini API key validation failed with status:", response.status);
        return false;
      }
      
      const data = await response.json();
      console.log("Gemini API validation successful:", data);
      return true;
    } catch (error) {
      console.error("Gemini API key validation failed:", error);
      return false;
    }
  }

  async analyzeCode(code: string): Promise<string> {
    // Default to gemini-1.5-pro model which should be available
    return this.generateCompletion({
      model: "gemini-1.5-pro",
      prompt: `Analyze this code:\n\n${code}\n\nProvide a detailed analysis including:
1. Main components and their functions
2. Language and framework identification
3. Key integration points
4. Potential issues or improvements`,
      maxTokens: 1024,
      temperature: 0.2
    });
  }

  async analyzeAndSuggestIntegrations(code: string): Promise<string> {
    // Default to gemini-1.5-pro model which should be available
    return this.generateCompletion({
      model: "gemini-1.5-pro",
      prompt: `Analyze this code and suggest potential integrations:\n\n${code}\n\nProvide:
1. Current architecture overview
2. Potential integration points
3. Suggested improvements for better AI integration
4. Examples of how Gemini could enhance functionality`,
      maxTokens: 1024,
      temperature: 0.3
    });
  }
}

export interface GeminiApiKeyStorage {
  getApiKey(): string | null;
  setApiKey(key: string): void;
  clearApiKey(): void;
}

export class LocalStorageGeminiApi implements GeminiApiKeyStorage {
  private readonly STORAGE_KEY = "gemini_api_key";
  
  getApiKey(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }
  
  setApiKey(key: string): void {
    localStorage.setItem(this.STORAGE_KEY, key);
  }
  
  clearApiKey(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const geminiApiStorage = new LocalStorageGeminiApi();
