
import { BaseApiService } from "../api/BaseApiService";
import { Company } from "@/types";

export class FolderGenerationService extends BaseApiService {
  async generateFolderNameAndDescription(
    userInput: string, 
    prompt: string, 
    model: string,
    company?: Company
  ): Promise<{ name: string; description: string }> {
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
      
      // Replace placeholder in prompt
      const formattedPrompt = prompt.replace("{{user_input}}", enrichedInput);

      // Show loading toast
      this.showToast("loading", "Génération en cours...", "Création d'un nouveau dossier");

      const data = await this.callOpenAI(
        model,
        [{ role: "user", content: formattedPrompt }],
        { 
          max_tokens: 500,
          responseFormat: { type: "json_object" }
        }
      );

      try {
        const jsonResponse = JSON.parse(data.choices[0].message.content);
        
        // Extract name and description, provide defaults if missing
        const name = jsonResponse.name || "Nouveau dossier";
        const description = jsonResponse.description || "Description générée automatiquement";
        
        // Update toast to success
        this.showToast("success", "Dossier créé", `"${name}" généré avec succès`);
        
        return { name, description };
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        throw new Error("Format de réponse invalide");
      }
    } catch (error) {
      console.error("Error generating folder name:", error);
      this.showToast("error", "Erreur de génération", `${(error as Error).message}`);
      throw error;
    }
  }
}
