
import { BaseApiService } from "../api/BaseApiService";
import { Company } from "@/types";

export class UseCaseListGenerationService extends BaseApiService {
  async generateUseCaseList(
    userInput: string, 
    prompt: string, 
    model: string,
    company?: Company
  ): Promise<string[]> {
    try {
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

      // Combine user input with company info
      const enrichedInput = company 
        ? `${userInput}\n\n${companyInfo}`
        : userInput;
      
      const formattedPrompt = prompt.replace("{{user_input}}", enrichedInput);
      
      // Update the existing toast
      this.showToast("loading", "Génération en cours...", "Création de la liste des cas d'usage");

      const data = await this.callOpenAI(
        model,
        [{ role: "user", content: formattedPrompt }],
        { max_tokens: 1000 }
      );

      const content = data.choices[0].message.content;

      // Parse the numbered list to extract use case titles
      const useCases = content
        .split("\n")
        .filter((line: string) => /^\d+\./.test(line.trim()))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      // Update toast with success message
      this.showToast("loading", "Liste des cas d'usage créée", `${useCases.length} cas d'usage identifiés`);

      return useCases;
    } catch (error) {
      console.error("Error generating use case list:", error);
      this.showToast("error", "Erreur de génération", `${(error as Error).message}`);
      throw error;
    }
  }
}
