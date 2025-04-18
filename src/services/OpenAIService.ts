
import { UseCase, MatrixConfig, Company } from "../types";
import { FolderGenerationService } from "./generation/FolderGenerationService";
import { UseCaseListGenerationService } from "./generation/UseCaseListGenerationService";
import { UseCaseDetailGenerationService } from "./generation/UseCaseDetailGenerationService";
import { BaseApiService } from "./api/BaseApiService";
import { toast } from "sonner";
import { RequestQueueService } from "./queue/RequestQueueService";

export class OpenAIService extends BaseApiService {
  private folderService: FolderGenerationService;
  private listService: UseCaseListGenerationService;
  private detailService: UseCaseDetailGenerationService;
  private requestQueue: RequestQueueService<any>;

  constructor(apiKey: string, concurrency: number = 5) {
    super(apiKey);
    this.folderService = new FolderGenerationService(apiKey);
    this.listService = new UseCaseListGenerationService(apiKey);
    this.detailService = new UseCaseDetailGenerationService(apiKey);
    // Initialize the request queue with the specified concurrency
    this.requestQueue = new RequestQueueService<any>(concurrency);
  }

  // Update concurrency setting
  setConcurrency(concurrency: number): void {
    this.requestQueue.setConcurrency(concurrency);
  }

  // Get queue stats
  getQueueStats() {
    return {
      waiting: this.requestQueue.getQueueLength(),
      running: this.requestQueue.getRunningCount(),
      total: this.requestQueue.getTotalCount()
    };
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
    return new Promise((resolve, reject) => {
      // Create task for the queue
      this.requestQueue.enqueue({
        id: `use-case-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        execute: () => this.detailService.generateUseCaseDetail(
          useCase, userInput, matrixConfig, prompt, model, company
        ),
        onStart: () => {
          toast.loading(`Génération de "${useCase}"...`, {
            id: `toast-${useCase}`,
            description: "En cours de traitement"
          });
        },
        onSuccess: (result) => {
          toast.success(`Cas d'usage généré`, {
            id: `toast-${useCase}`,
            description: `"${useCase}" complété avec succès`
          });
          resolve(result);
        },
        onError: (error) => {
          toast.error(`Échec de génération`, {
            id: `toast-${useCase}`,
            description: `Erreur pour "${useCase}": ${error.message}`
          });
          reject(error);
        }
      });
      
      // Display queue status if there are items waiting
      const stats = this.getQueueStats();
      if (stats.waiting > 0) {
        toast.info(`File d'attente`, {
          description: `${stats.running} en cours, ${stats.waiting} en attente`,
          id: "queue-status",
          duration: 3000
        });
      }
    });
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
    // Using responses endpoint for newer API
    const endpoint = "https://api.openai.com/v1/responses";
    
    // Convert messages to input format if needed
    if (options.messages && !options.input) {
      // When assigning messages to input, ensure it remains an array or convert to string
      options.input = Array.isArray(options.messages) ? options.messages : JSON.stringify(options.messages);
      delete options.messages;
    }
    
    // Convert functions to tools if needed (for compatibility)
    if (options.functions && !options.tools) {
      options.tools = options.functions;
      delete options.functions;
      
      if (options.function_call && !options.tool_choice) {
        options.tool_choice = options.function_call;
        delete options.function_call;
      }
    }

    // Remove max_tokens parameter as it's not supported in the Responses API
    if (options.max_tokens) {
      delete options.max_tokens;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error("OpenAI API request failed:", error);
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
