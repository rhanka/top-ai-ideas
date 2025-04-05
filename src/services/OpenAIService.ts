
import { toast } from "sonner";
import { UseCase, MatrixConfig } from "../types";

export class OpenAIService {
  private apiKey: string;
  private toastId: string | number | undefined;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateFolderInfo(userInput: string, prompt: string): Promise<{ name: string; description: string }> {
    try {
      this.toastId = toast.loading("Génération en cours...", {
        description: "Création du dossier",
        duration: Infinity, // Keep toast open
        id: this.toastId
      });

      const formattedPrompt = prompt.replace("{{user_input}}", userInput);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: formattedPrompt }],
          temperature: 0.7,
          max_tokens: 300,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        toast.error("Erreur API OpenAI", { 
          description: error.error?.message || "Échec de la génération du nom de dossier",
          id: this.toastId 
        });
        throw new Error(error.error?.message || "Failed to generate folder name");
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);

      // Update toast with success message
      toast.loading("Dossier créé", { 
        description: `"${content.name}" créé avec succès`,
        id: this.toastId 
      });

      return {
        name: content.name || "Nouveau dossier",
        description: content.description || ""
      };
    } catch (error) {
      console.error("Error generating folder info:", error);
      toast.error("Erreur de génération", { 
        description: `${(error as Error).message}`,
        id: this.toastId 
      });
      // Return default values if generation fails
      return {
        name: "Nouveau dossier",
        description: "Créé automatiquement"
      };
    }
  }

  async generateUseCaseList(userInput: string, prompt: string): Promise<string[]> {
    try {
      const formattedPrompt = prompt.replace("{{user_input}}", userInput);

      // Update the existing toast instead of creating a new one
      this.toastId = toast.loading("Génération en cours...", {
        description: "Création de la liste des cas d'usage",
        duration: Infinity, // Keep toast open
        id: this.toastId
      });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: formattedPrompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        toast.error("Erreur API OpenAI", { 
          description: error.error?.message || "Échec de la génération des cas d'usage",
          id: this.toastId 
        });
        throw new Error(error.error?.message || "Failed to generate use cases");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse the numbered list to extract use case titles
      const useCases = content
        .split("\n")
        .filter((line: string) => /^\d+\./.test(line.trim()))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      // Update toast with success message
      toast.loading("Liste des cas d'usage créée", { 
        description: `${useCases.length} cas d'usage identifiés`,
        id: this.toastId 
      });

      return useCases;
    } catch (error) {
      console.error("Error generating use case list:", error);
      toast.error("Erreur de génération", { 
        description: `${(error as Error).message}`,
        id: this.toastId 
      });
      throw error;
    }
  }

  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string
  ): Promise<UseCase> {
    try {
      // Create a simplified matrix representation for the prompt
      const matrixSummary = {
        valueAxes: matrixConfig.valueAxes.map((axis) => ({
          name: axis.name,
          description: axis.description,
        })),
        complexityAxes: matrixConfig.complexityAxes.map((axis) => ({
          name: axis.name,
          description: axis.description,
        })),
      };

      // Update the loading toast for this specific use case
      toast.loading("Génération en cours...", { 
        description: `Création des détails pour "${useCase}"`,
        id: this.toastId 
      });

      const formattedPrompt = prompt
        .replace("{{use_case}}", useCase)
        .replace("{{user_input}}", userInput)
        .replace("{{matrix}}", JSON.stringify(matrixSummary, null, 2));

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: formattedPrompt }],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        toast.error("Erreur API OpenAI", { 
          description: `Échec pour "${useCase}": ${error.error?.message}`,
          id: this.toastId 
        });
        throw new Error(error.error?.message || "Failed to generate use case detail");
      }

      const data = await response.json();
      const jsonContent = JSON.parse(data.choices[0].message.content);

      // Generate a unique ID for the use case
      const id = `ID${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

      // Ensure all required fields are present
      const completeUseCase = {
        id,
        name: jsonContent.name || useCase,
        domain: jsonContent.domain || "",
        description: jsonContent.description || "",
        technology: jsonContent.technology || "",
        deadline: jsonContent.deadline || "",
        contact: jsonContent.contact || "",
        benefits: jsonContent.benefits || [],
        metrics: jsonContent.metrics || [],
        risks: jsonContent.risks || [],
        nextSteps: jsonContent.nextSteps || [],
        sources: jsonContent.sources || [],
        relatedData: jsonContent.relatedData || [],
        valueScores: jsonContent.valueScores || [],
        complexityScores: jsonContent.complexityScores || [],
        folderId: "" // Add the required folderId property (will be set by AppContext)
      };

      // Update toast with success for this specific use case
      toast.loading("Génération en cours...", { 
        description: `Cas d'usage "${useCase}" complété avec succès`,
        id: this.toastId 
      });

      return completeUseCase;
    } catch (error) {
      console.error("Error generating use case detail:", error);
      toast.error("Erreur de génération", { 
        description: `${(error as Error).message}`,
        id: this.toastId 
      });
      throw error;
    }
  }

  // Method to finalize the generation process
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
