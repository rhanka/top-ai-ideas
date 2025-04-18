import { UseCase, MatrixConfig, Company } from "../types";
import { FolderGenerationService } from "./generation/FolderGenerationService";
import { UseCaseListGenerationService } from "./generation/UseCaseListGenerationService";
import { UseCaseDetailGenerationService } from "./generation/UseCaseDetailGenerationService";
import { BaseApiService } from "./api/BaseApiService";
import { toast } from "sonner";

export class OpenAIService extends BaseApiService {
  private folderService: FolderGenerationService;
  private listService: UseCaseListGenerationService;
  private detailService: UseCaseDetailGenerationService;

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
    messages: { role: string; content: string }[];
    functions?: any[];
    function_call?: any;
    temperature?: number;
    max_tokens?: number;
  }) {
    const endpoint = "https://api.openai.com/v1/responses";

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
    
    this.toastId = undefined;
  }
}
