
import { toast } from "sonner";

interface HuggingFaceModelOption {
  id: string;
  name: string;
  description: string;
}

export const HUGGINGFACE_MODELS: HuggingFaceModelOption[] = [
  { id: "gpt2", name: "GPT-2", description: "OpenAI's GPT-2 language model" },
  { id: "microsoft/DialoGPT-large", name: "DialoGPT Large", description: "Microsoft's dialogue generation model" },
  { id: "facebook/blenderbot-400M-distill", name: "BlenderBot 400M", description: "Facebook's conversational AI" },
  { id: "EleutherAI/gpt-neo-1.3B", name: "GPT-Neo 1.3B", description: "EleutherAI's GPT-Neo model" },
  { id: "EleutherAI/gpt-j-6B", name: "GPT-J 6B", description: "EleutherAI's GPT-J model" },
  { id: "bigscience/bloom", name: "BLOOM", description: "BigScience's Large Language Model" },
  { id: "google/flan-t5-xxl", name: "Flan-T5 XXL", description: "Google's Flan-T5 model" },
  { id: "meta-llama/Llama-2-7b-chat-hf", name: "Llama-2 7B Chat", description: "Meta's Llama 2 chat model" },
  { id: "tiiuae/falcon-7b", name: "Falcon 7B", description: "TIIUAE's Falcon model" },
  { id: "mistralai/Mistral-7B-Instruct-v0.2", name: "Mistral 7B Instruct", description: "Mistral AI's instruction-tuned model" }
];

export interface CompletionParams {
  prompt: string;
  model: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
}

export interface CompletionResponse {
  generated_text: string;
}

export class HuggingFaceService {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(params: CompletionParams): Promise<string> {
    try {
      const { model, prompt, max_tokens = 100, temperature = 0.7, top_p = 0.9, stop = [] } = params;
      
      const url = `${this.baseUrl}/${model}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: max_tokens,
            temperature: temperature,
            top_p: top_p,
            stop_sequences: stop,
            return_full_text: false
          }
        })
      });
      
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to generate text");
      }
      
      const result = await response.json();
      
      // Different models return results in different formats
      if (Array.isArray(result)) {
        return result[0].generated_text;
      } else if (result.generated_text) {
        return result.generated_text;
      } else {
        console.error("Unexpected response format:", result);
        return result.toString();
      }
    } catch (error) {
      console.error("Error generating completion:", error);
      toast.error("Error generating text. Please try again.");
      throw error;
    }
  }

  async analyzeCode(code: string): Promise<string> {
    // We'll use a specialized model for code understanding
    return this.generateCompletion({
      model: "gpt2", // Replace with more appropriate model for production
      prompt: `Analyze this code:\n\n${code}\n\nAnalysis:`,
      max_tokens: 500,
      temperature: 0.3
    });
  }
}

// Type for API key storage
export interface HuggingFaceApiKeyStorage {
  getApiKey(): string | null;
  setApiKey(key: string): void;
  clearApiKey(): void;
}

// Local storage implementation for API key
export class LocalStorageHuggingFaceApi implements HuggingFaceApiKeyStorage {
  private readonly STORAGE_KEY = "huggingface_api_key";
  
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

// Create a singleton instance
export const huggingFaceApiStorage = new LocalStorageHuggingFaceApi();
