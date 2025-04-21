
import { BaseApiService } from "../api/BaseApiService";
import { MatrixConfig, UseCase, Company, BusinessProcess } from "@/types";

export class UseCaseDetailGenerationService extends BaseApiService {
  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string,
    model: string,
    company?: Company,
    processes?: BusinessProcess[]
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

      // Construct company information if available
      let companyInfo = "";
      if (company) {
        companyInfo = `
Informations sur l'entreprise:
- Nom: ${company.name}
- Secteur d'activité: ${company.industry}
- Taille: ${company.size}
- Produits/Services: ${company.products}
- Processus clés: ${company.processes}
- Défis majeurs: ${company.challenges}
- Objectifs stratégiques: ${company.objectives}
- Technologies utilisées: ${company.technologies}
`;
      }

      // Construire la liste de processus métiers à prendre en compte
      let businessProcessesInfo = "";
      if (processes && processes.length > 0) {
        businessProcessesInfo = processes.map(p => {
          return `- ${p.id}: ${p.name} - ${p.description}`;
        }).join("\n");
      } else {
        businessProcessesInfo = "Pas de processus métiers spécifiques définis.";
      }

      // Combine user input with company info
      const enrichedInput = company 
        ? `${userInput}\n\n${companyInfo}`
        : userInput;

      // Update the loading toast for this specific use case
      this.showToast("loading", "Génération en cours...", `Création des détails pour "${useCase}"`);

      const formattedPrompt = prompt
        .replace("{{use_case}}", useCase)
        .replace("{{user_input}}", enrichedInput)
        .replace("{{matrix}}", JSON.stringify(matrixSummary, null, 2))
        .replace("{{business_processes}}", businessProcessesInfo);

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
        folderId: "", // Initialize empty string, will be set correctly in useOpenAI hook
        businessProcesses: jsonContent.businessProcesses || []
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
