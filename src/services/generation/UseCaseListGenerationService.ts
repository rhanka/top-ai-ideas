
import { BaseApiService } from "../api/BaseApiService";

export class UseCaseListGenerationService extends BaseApiService {
  async generateUseCaseList(userInput: string, prompt: string, model: string): Promise<string[]> {
    try {
      const formattedPrompt = prompt.replace("{{user_input}}", userInput);
      
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
