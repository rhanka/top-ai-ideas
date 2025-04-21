
import { BaseApiService } from "../api/BaseApiService";
import { MatrixConfig, UseCase, Company } from "@/types";
import { BusinessProcess } from "@/types/business";

export class UseCaseDetailGenerationService extends BaseApiService {
  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string,
    model: string,
    processes: BusinessProcess[],
    company?: Company
  ): Promise<UseCase> {
    try {
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

      const processesInfo = JSON.stringify(processes.map(p => ({
        id: p.id,
        name: p.name
      })));

      let companyInfo = "";
      if (company) {
        companyInfo = `
Informations sur l'entreprise:
- Nom: ${company.name}
- Secteur: ${company.industry}
- Taille: ${company.size}
- Produits/Services: ${company.products}
- Processus existants: ${company.processes.join(", ")}
- Défis: ${company.challenges}
- Objectifs: ${company.objectives}
- Technologies: ${company.technologies}
`;
      }

      const enrichedInput = company 
        ? `${userInput}\n\n${companyInfo}`
        : userInput;

      this.showToast("loading", "Génération en cours...", `Création des détails pour "${useCase}"`);

      const customPrompt = `Analysez le cas d'usage "${useCase}" dans le contexte suivant: ${enrichedInput}

Générez une description détaillée en prenant en compte la matrice d'évaluation: ${JSON.stringify(matrixSummary, null, 2)}

La réponse doit suivre ce format JSON:
{
  "name": "${useCase}",
  "process": "Identifiez le processus métier principal parmi: ${processesInfo}",
  "description": "Description détaillée sur 5-10 lignes",
  "technology": "Technologies d'IA à utiliser",
  "deadline": "Estimation du délai",
  "contact": "Responsable suggéré",
  "benefits": ["5 bénéfices"],
  "metrics": ["3 KPIs"],
  "risks": ["3 risques"],
  "nextSteps": ["4 étapes"],
  "sources": ["2 sources"],
  "relatedData": ["3 données"],
  "valueScores": [
    {
      "axisId": "Nom axe valeur",
      "rating": 4,
      "description": "Justification"
    }
  ],
  "complexityScores": [
    {
      "axisId": "Nom axe complexité",
      "rating": 3,
      "description": "Justification"
    }
  ]
}`;

      const data = await this.callOpenAI(
        model,
        [{ role: "user", content: customPrompt }],
        { 
          max_tokens: 4000,
          responseFormat: { type: "json_object" }
        }
      );

      const jsonContent = JSON.parse(data.choices[0].message.content);
      const id = `ID${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

      const completeUseCase = {
        id,
        name: jsonContent.name || useCase,
        process: jsonContent.process || "",
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
        folderId: ""
      };

      this.showToast("loading", "Génération en cours...", `Cas d'usage "${useCase}" complété avec succès`);

      return completeUseCase;
    } catch (error) {
      console.error("Error generating use case detail:", error);
      this.showToast("error", "Erreur de génération", `${(error as Error).message}`);
      throw error;
    }
  }
}
