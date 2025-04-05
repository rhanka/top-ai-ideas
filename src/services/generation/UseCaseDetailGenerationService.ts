
import { BaseApiService } from "../api/BaseApiService";
import { MatrixConfig, UseCase } from "@/types";

export class UseCaseDetailGenerationService extends BaseApiService {
  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string,
    model: string
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
      this.showToast("loading", "Génération en cours...", `Création des détails pour "${useCase}"`);

      const formattedPrompt = prompt
        .replace("{{use_case}}", useCase)
        .replace("{{user_input}}", userInput)
        .replace("{{matrix}}", JSON.stringify(matrixSummary, null, 2));

      const data = await this.callOpenAI(
        model,
        [{ role: "user", content: formattedPrompt }],
        { 
          max_tokens: 4000,
          responseFormat: { type: "json_object" }
        }
      );

      const jsonContent = JSON.parse(data.choices[0].message.content);

      // Generate a unique ID for the use case
      const id = `ID${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

      // Ensure all required fields are present and initialize folderId correctly
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
        folderId: "" // Initialize empty string, will be set correctly in useOpenAI hook
      };

      // Update toast with success for this specific use case
      this.showToast("loading", "Génération en cours...", `Cas d'usage "${useCase}" complété avec succès`);

      return completeUseCase;
    } catch (error) {
      console.error("Error generating use case detail:", error);
      this.showToast("error", "Erreur de génération", `${(error as Error).message}`);
      throw error;
    }
  }
}
