
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
  private queueToastId: string | undefined;
  private successCount: number = 0;
  private failureCount: number = 0;
  private totalTasks: number = 0;

  constructor(apiKey: string, concurrencyLimit: number = 5, maxRetryAttempts: number = 3) {
    super(apiKey);
    this.folderService = new FolderGenerationService(apiKey);
    this.listService = new UseCaseListGenerationService(apiKey);
    this.detailService = new UseCaseDetailGenerationService(apiKey);
    
    // Initialiser la file d'attente avec le nombre de requêtes parallèles
    this.requestQueue = new ParallelQueueService(concurrencyLimit, maxRetryAttempts);
    
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
  
  // Mettre à jour le nombre maximum de tentatives
  setMaxRetryAttempts(attempts: number) {
    this.requestQueue.setMaxRetryAttempts(attempts);
  }
  
  // Réinitialiser les compteurs de succès et d'échec
  resetCounters() {
    this.successCount = 0;
    this.failureCount = 0;
    this.totalTasks = 0;
  }
  
  // Gérer le démarrage d'une tâche
  private handleTaskStart(task: QueueTask<any>) {
    console.log(`Démarrage de la tâche: ${task.name}`);
  }
  
  // Gérer la fin d'une tâche
  private handleTaskComplete(task: QueueTask<any>, result: any) {
    console.log(`Tâche terminée: ${task.name}`);
    this.successCount++;
    
    // Vérifier si toutes les tâches sont terminées pour afficher un résumé
    this.checkForCompletion();
  }
  
  // Gérer une erreur de tâche
  private handleTaskError(task: QueueTask<any>, error: Error) {
    console.error(`Erreur dans la tâche ${task.name}:`, error);
    this.failureCount++;
    
    toast.error(`Erreur: ${task.name}`, {
      description: error.message,
      duration: 5000
    });
    
    // Vérifier si toutes les tâches sont terminées pour afficher un résumé
    this.checkForCompletion();
  }
  
  // Vérifier si toutes les tâches sont terminées pour afficher un résumé
  private checkForCompletion() {
    const completedTasks = this.successCount + this.failureCount;
    
    if (completedTasks === this.totalTasks && this.totalTasks > 0) {
      // Toutes les tâches sont terminées, afficher un résumé
      this.showCompletionSummary();
    }
  }
  
  // Afficher un résumé de la génération
  private showCompletionSummary() {
    // Effacer le toast de la file d'attente
    if (this.queueToastId) {
      toast.dismiss(this.queueToastId);
      this.queueToastId = undefined;
    }
    
    if (this.failureCount === 0) {
      // Tous les cas ont été générés avec succès
      toast.success(`Génération terminée avec succès`, {
        description: `${this.successCount} cas d'usage générés.`,
        duration: 5000
      });
    } else if (this.successCount > 0) {
      // Certains cas ont été générés, mais d'autres ont échoué
      toast.warning(`Génération partiellement terminée`, {
        description: `${this.successCount} cas générés, ${this.failureCount} cas ont échoué.`,
        duration: 7000
      });
    } else {
      // Tous les cas ont échoué
      toast.error(`Échec de la génération`, {
        description: `Aucun cas d'usage n'a pu être généré. ${this.failureCount} tentatives échouées.`,
        duration: 7000
      });
    }
  }
  
  // Mettre à jour le statut de la file d'attente
  private updateQueueStatus(queueLength: number, activeCount: number) {
    const totalTasks = queueLength + activeCount + this.successCount + this.failureCount;
    
    if (totalTasks === 0) {
      // Si plus de tâches, supprimer le toast de statut
      if (this.queueToastId) {
        toast.dismiss(this.queueToastId);
        this.queueToastId = undefined;
      }
      return;
    }
    
    // Mise à jour du nombre total de tâches si c'est plus grand
    if (totalTasks > this.totalTasks) {
      this.totalTasks = totalTasks;
    }
    
    // Calculer la progression
    const progress = ((this.successCount + this.failureCount) / this.totalTasks) * 100;
    const progressText = Math.round(progress) + '%';
    
    // Créer ou mettre à jour le toast de statut
    const toastMessage = `Génération en cours (${progressText})`;
    const description = `${activeCount} requête${activeCount > 1 ? 's' : ''} active${activeCount > 1 ? 's' : ''}${
      queueLength > 0 ? `, ${queueLength} en attente` : ''
    }${
      this.successCount > 0 ? `, ${this.successCount} réussie${this.successCount > 1 ? 's' : ''}` : ''
    }${
      this.failureCount > 0 ? `, ${this.failureCount} échec${this.failureCount > 1 ? 's' : ''}` : ''
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
      }) as string; // Cast to string as the toast ID will always be a string
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
              // When assigning messages to input, ensure it remains compatible with the API
              options.input = { messages: options.messages };
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

  finalizeGeneration() {
    // Cette méthode n'est plus nécessaire car nous avons maintenant showCompletionSummary
    // qui gère l'affichage du résumé de génération
    
    // Réinitialiser les compteurs pour les prochaines opérations
    this.resetCounters();
  }
}
