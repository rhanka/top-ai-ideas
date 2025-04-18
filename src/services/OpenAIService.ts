
import { UseCase, MatrixConfig, Company } from "../types";
import { FolderGenerationService } from "./generation/FolderGenerationService";
import { UseCaseListGenerationService } from "./generation/UseCaseListGenerationService";
import { UseCaseDetailGenerationService } from "./generation/UseCaseDetailGenerationService";
import { BaseApiService } from "./api/BaseApiService";
import { toast } from "sonner";
import { ParallelQueueService, QueueTask } from "./queue/ParallelQueueService";
import { v4 as uuidv4 } from "uuid";

export class OpenAIService extends BaseApiService {
  private folderService: FolderGenerationService;
  private listService: UseCaseListGenerationService;
  private detailService: UseCaseDetailGenerationService;
  private requestQueue: ParallelQueueService<any>;
  private queueToastId?: string;

  constructor(apiKey: string, concurrencyLimit: number = 5) {
    super(apiKey);
    this.folderService = new FolderGenerationService(apiKey);
    this.listService = new UseCaseListGenerationService(apiKey);
    this.detailService = new UseCaseDetailGenerationService(apiKey);
    
    // Initialiser la file d'attente avec le nombre de requêtes parallèles
    this.requestQueue = new ParallelQueueService(concurrencyLimit);
    
    // Configurer les gestionnaires d'événements pour la file d'attente
    this.requestQueue.setEventHandlers({
      onStart: (task) => this.handleTaskStart(task),
      onComplete: (task, result) => this.handleTaskComplete(task, result),
      onError: (task, error) => this.handleTaskError(task, error),
      onQueueUpdate: (queueLength, activeCount) => this.updateQueueStatus(queueLength, activeCount)
    });
  }
  
  // Mettre à jour le nombre maximum de requêtes parallèles
  setConcurrencyLimit(limit: number) {
    this.requestQueue.setConcurrencyLimit(limit);
  }
  
  // Gérer le démarrage d'une tâche
  private handleTaskStart(task: QueueTask<any>) {
    console.log(`Démarrage de la tâche: ${task.name}`);
  }
  
  // Gérer la fin d'une tâche
  private handleTaskComplete(task: QueueTask<any>, result: any) {
    console.log(`Tâche terminée: ${task.name}`);
  }
  
  // Gérer une erreur de tâche
  private handleTaskError(task: QueueTask<any>, error: Error) {
    console.error(`Erreur dans la tâche ${task.name}:`, error);
    toast.error(`Erreur: ${task.name}`, {
      description: error.message,
      duration: 5000
    });
  }
  
  // Mettre à jour le statut de la file d'attente
  private updateQueueStatus(queueLength: number, activeCount: number) {
    const totalTasks = queueLength + activeCount;
    
    if (totalTasks === 0) {
      // Si plus de tâches, supprimer le toast de statut
      if (this.queueToastId) {
        toast.dismiss(this.queueToastId);
        this.queueToastId = undefined;
      }
      return;
    }
    
    // Créer ou mettre à jour le toast de statut
    const toastMessage = `Génération en cours`;
    const description = `${activeCount} requête${activeCount > 1 ? 's' : ''} active${activeCount > 1 ? 's' : ''}${
      queueLength > 0 ? `, ${queueLength} en attente` : ''
    }`;
    
    if (this.queueToastId) {
      toast.loading(toastMessage, {
        id: this.queueToastId,
        description: description,
        duration: Infinity
      });
    } else {
      this.queueToastId = toast.loading(toastMessage, {
        description: description,
        duration: Infinity
      }) as string;
    }
  }

  async generateFolderNameAndDescription(
    userInput: string, 
    prompt: string, 
    model: string,
    company?: Company
  ): Promise<{ name: string; description: string }> {
    const taskId = uuidv4();
    
    return new Promise((resolve, reject) => {
      this.requestQueue.enqueue({
        id: taskId,
        name: "Génération de dossier",
        execute: async () => {
          try {
            const result = await this.folderService.generateFolderNameAndDescription(userInput, prompt, model, company);
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        }
      });
    });
  }

  async generateUseCaseList(
    userInput: string, 
    prompt: string, 
    model: string,
    company?: Company
  ): Promise<string[]> {
    const taskId = uuidv4();
    
    return new Promise((resolve, reject) => {
      this.requestQueue.enqueue({
        id: taskId,
        name: "Génération de liste de cas d'usage",
        execute: async () => {
          try {
            const result = await this.listService.generateUseCaseList(userInput, prompt, model, company);
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        }
      });
    });
  }

  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string,
    model: string,
    company?: Company
  ): Promise<UseCase> {
    const taskId = uuidv4();
    
    return new Promise((resolve, reject) => {
      this.requestQueue.enqueue({
        id: taskId,
        name: `Détails pour "${useCase}"`,
        execute: async () => {
          try {
            const result = await this.detailService.generateUseCaseDetail(
              useCase, userInput, matrixConfig, prompt, model, company
            );
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        }
      });
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
    const taskId = uuidv4();
    
    return new Promise((resolve, reject) => {
      this.requestQueue.enqueue({
        id: taskId,
        name: "Requête API OpenAI",
        execute: async () => {
          try {
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

            const result = await response.json();
            resolve(result);
            return result;
          } catch (error) {
            console.error("OpenAI API request failed:", error);
            reject(error);
            throw error;
          }
        }
      });
    });
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
    
    // Effacer également le toast de la file d'attente s'il existe
    if (this.queueToastId) {
      toast.dismiss(this.queueToastId);
      this.queueToastId = undefined;
    }
  }
}
