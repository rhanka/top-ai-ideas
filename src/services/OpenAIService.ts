
import { UseCase, MatrixConfig, Company } from "../types";
import { FolderGenerationService } from "./generation/FolderGenerationService";
import { UseCaseListGenerationService } from "./generation/UseCaseListGenerationService";
import { UseCaseDetailGenerationService } from "./generation/UseCaseDetailGenerationService";
import { BaseApiService } from "./api/BaseApiService";
import { toast } from "sonner";
import { ParallelQueueService, QueueTask, QueueStats } from "./queue/ParallelQueueService";
import { v4 as uuidv4 } from "uuid";

export class OpenAIService extends BaseApiService {
  private folderService: FolderGenerationService;
  private listService: UseCaseListGenerationService;
  private detailService: UseCaseDetailGenerationService;
  private requestQueue: ParallelQueueService<any>;
  private queueToastId?: string;
  private generationToastId?: string;
  private useCaseSuccessCount: number = 0;
  private useCaseFailureCount: number = 0;

  constructor(apiKey: string, concurrencyLimit: number = 5, maxRetries: number = 3) {
    super(apiKey);
    this.folderService = new FolderGenerationService(apiKey);
    this.listService = new UseCaseListGenerationService(apiKey);
    this.detailService = new UseCaseDetailGenerationService(apiKey);
    
    // Initialiser la file d'attente avec le nombre de requêtes parallèles et tentatives
    this.requestQueue = new ParallelQueueService(concurrencyLimit, maxRetries);
    
    // Configurer les gestionnaires d'événements pour la file d'attente
    this.requestQueue.setEventHandlers({
      onStart: (task) => this.handleTaskStart(task),
      onComplete: (task, result) => this.handleTaskComplete(task, result),
      onError: (task, error, willRetry) => this.handleTaskError(task, error, willRetry),
      onQueueUpdate: (queueLength, activeCount) => this.updateQueueStatus(queueLength, activeCount),
      onQueueComplete: (stats) => this.handleQueueComplete(stats),
    });
  }
  
  // Mettre à jour le nombre maximum de requêtes parallèles
  setConcurrencyLimit(limit: number) {
    this.requestQueue.setConcurrencyLimit(limit);
  }
  
  // Mettre à jour le nombre de tentatives de réessai
  setMaxRetries(limit: number) {
    this.requestQueue.setMaxRetries(limit);
  }
  
  resetUseCaseCounters() {
    this.useCaseSuccessCount = 0;
    this.useCaseFailureCount = 0;
  }
  
  // Gérer le démarrage d'une tâche
  private handleTaskStart(task: QueueTask<any>) {
    console.log(`Démarrage de la tâche: ${task.name}`);
  }
  
  // Gérer la fin d'une tâche
  private handleTaskComplete(task: QueueTask<any>, result: any) {
    console.log(`Tâche terminée: ${task.name}`);
    
    // Si c'est une tâche de génération de cas d'usage, incrémenter le compteur
    if (task.name.startsWith("Détails pour")) {
      this.useCaseSuccessCount++;
    }
  }
  
  // Gérer une erreur de tâche
  private handleTaskError(task: QueueTask<any>, error: Error, willRetry: boolean) {
    console.error(`Erreur dans la tâche ${task.name}:`, error);
    
    if (willRetry) {
      toast.error(`Réessai: ${task.name}`, {
        description: `Tentative ${task.retryCount}/${task.maxRetries}: ${error.message.substring(0, 100)}`,
        duration: 3000
      });
    } else {
      toast.error(`Échec: ${task.name}`, {
        description: `${error.message.substring(0, 100)}`,
        duration: 5000
      });
      
      // Si c'est une tâche de génération de cas d'usage et qu'on ne réessaie pas, incrémenter le compteur d'échecs
      if (task.name.startsWith("Détails pour")) {
        this.useCaseFailureCount++;
      }
    }
  }
  
  // Gérer la fin de toutes les tâches dans la file
  private handleQueueComplete(stats: QueueStats) {
    console.log("Queue completed with stats:", stats);
    
    // Supprimer le toast de la file d'attente s'il existe
    if (this.queueToastId) {
      toast.dismiss(this.queueToastId);
      this.queueToastId = undefined;
    }
    
    // Afficher le résultat final de la génération de cas d'usage
    if (this.generationToastId) {
      const totalUseCases = this.useCaseSuccessCount + this.useCaseFailureCount;
      
      if (this.useCaseFailureCount > 0) {
        toast.warning(`Génération terminée avec avertissements`, {
          id: this.generationToastId,
          description: `${this.useCaseSuccessCount} cas réussis, ${this.useCaseFailureCount} cas échoués`,
          duration: 5000
        });
      } else {
        toast.success(`Génération terminée`, { 
          id: this.generationToastId,
          description: `${this.useCaseSuccessCount} cas d'usage générés avec succès !`,
          duration: 5000
        });
      }
      
      this.generationToastId = undefined;
    }
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
            
            const requestOptions = { ...options };
            
            // Convert messages to input format if needed
            if (requestOptions.messages && !requestOptions.input) {
              if (Array.isArray(requestOptions.messages)) {
                requestOptions.input = { messages: requestOptions.messages };
              } else {
                requestOptions.input = JSON.stringify(requestOptions.messages);
              }
              delete requestOptions.messages;
            }
            
            // Convert functions to tools if needed (for compatibility)
            if (requestOptions.functions && !requestOptions.tools) {
              requestOptions.tools = requestOptions.functions;
              delete requestOptions.functions;
              
              if (requestOptions.function_call && !requestOptions.tool_choice) {
                requestOptions.tool_choice = requestOptions.function_call;
                delete requestOptions.function_call;
              }
            }

            // Remove max_tokens parameter as it's not supported in the Responses API
            if (requestOptions.max_tokens) {
              delete requestOptions.max_tokens;
            }

            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
              },
              body: JSON.stringify(requestOptions),
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
    // Stocker l'ID du toast pour le gérer plus tard
    this.generationToastId = this.toastId;
    
    // Ne pas afficher le toast de finalisation tout de suite, laisser la file d'attente se terminer
    // Le handleQueueComplete affichera le toast final avec les compteurs précis
    
    // Reset the toastId to ensure new toasts can be created
    this.toastId = undefined;
  }
}
