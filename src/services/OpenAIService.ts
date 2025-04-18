
import { UseCase, MatrixConfig, Company } from "../types";
import { FolderGenerationService } from "./generation/FolderGenerationService";
import { UseCaseListGenerationService } from "./generation/UseCaseListGenerationService";
import { UseCaseDetailGenerationService } from "./generation/UseCaseDetailGenerationService";
import { BaseApiService } from "./api/BaseApiService";
import { toast } from "sonner";
import axios from 'axios';

export class OpenAIService extends BaseApiService {
  private folderService: FolderGenerationService;
  private listService: UseCaseListGenerationService;
  private detailService: UseCaseDetailGenerationService;
  // We remove the redundant toastId declaration since it's already in BaseApiService

  constructor(apiKey: string) {
    super(apiKey);
    this.folderService = new FolderGenerationService(apiKey);
    this.listService = new UseCaseListGenerationService(apiKey);
    this.detailService = new UseCaseDetailGenerationService(apiKey);
  }

  async generateFolderNameAndDescription(
    userInput: string, 
    prompt: string, 
    model: string,
    company?: Company
  ): Promise<{ name: string; description: string }> {
    return this.folderService.generateFolderNameAndDescription(userInput, prompt, model, company);
  }

  async generateUseCaseList(
    userInput: string, 
    prompt: string, 
    model: string,
    company?: Company
  ): Promise<string[]> {
    return this.listService.generateUseCaseList(userInput, prompt, model, company);
  }

  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string,
    model: string,
    company?: Company
  ): Promise<UseCase> {
    return this.detailService.generateUseCaseDetail(useCase, userInput, matrixConfig, prompt, model, company);
  }

  async makeApiRequest(options: {
    model: string;
    messages?: { role: string; content: string }[];
    input?: { role?: string; content: string } | { messages: { role: string; content: string }[] } | string;
    functions?: any[];
    function_call?: any;
    tools?: any[];
    tool_choice?: any;
    temperature?: number;
    max_tokens?: number;
  }) {
    try {
      // Determine which endpoint to use based on parameters
      let endpoint = 'https://api.openai.com/v1/chat/completions';
      let requestData = { ...options };

      // If input is provided directly instead of messages array, convert it
      if (!options.messages && options.input) {
        // For the completion endpoint with tools
        if (options.tools) {
          endpoint = 'https://api.openai.com/v1/chat/completions';
          requestData.messages = [
            {
              role: "user",
              content: typeof options.input === 'string' 
                ? options.input 
                : 'object' in options.input 
                  ? JSON.stringify(options.input) 
                  : options.input.content
            }
          ];
          delete requestData.input;
        } else {
          // For the legacy completions endpoint
          endpoint = 'https://api.openai.com/v1/completions';
          requestData.prompt = options.input;
          delete requestData.input;
        }
      }

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (endpoint.includes('chat/completions')) {
        if (options.tools) {
          // Handle structured response with tools
          return {
            output: response.data.choices[0].message.tool_calls || 
                   response.data.choices[0].message.content || 
                   response.data.choices[0].message
          };
        } else {
          // Handle normal chat completion response
          return {
            text: response.data.choices[0].message.content
          };
        }
      } else {
        // Handle legacy completion response
        return {
          text: response.data.choices[0].text
        };
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  finalizeGeneration(success: boolean, count: number) {
    if (success) {
      toast.success(`Génération terminée`, { 
        description: `${count} cas d'usage générés avec succès !`,
        id: this.toastId,
        duration: 5000 // Close after 5 seconds
      });
    } else {
      toast.error("Échec de la génération", { 
        description: "Une erreur est survenue lors de la génération",
        id: this.toastId,
        duration: 5000 // Close after 5 seconds
      });
    }
    
    // Reset the toastId to ensure new toasts can be created
    this.toastId = undefined;
  }
}
