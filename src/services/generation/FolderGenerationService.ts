
import { BaseApiService } from "../api/BaseApiService";

export class FolderGenerationService extends BaseApiService {
  async generateFolderNameAndDescription(userInput: string, prompt: string, model: string): Promise<{ name: string; description: string }> {
    try {
      const formattedPrompt = prompt.replace("{{user_input}}", userInput);
      
      // Show toast for folder generation
      this.showToast("loading", "Génération en cours...", "Création automatique d'un dossier");

      const data = await this.callOpenAI(
        model,
        [{ role: "user", content: formattedPrompt }],
        { 
          max_tokens: 300,
          responseFormat: { type: "json_object" }
        }
      );

      const content = JSON.parse(data.choices[0].message.content);

      // Update toast to success
      this.showToast("success", "Dossier créé", `Dossier "${content.name}" créé avec succès`);

      return {
        name: content.name || "Nouveau dossier",
        description: content.description || "Dossier créé automatiquement"
      };
    } catch (error) {
      console.error("Error generating folder name:", error);
      this.showToast("error", "Erreur de génération", `${(error as Error).message}`);
      // Return default values in case of error
      return { name: "Nouveau dossier", description: "Dossier créé automatiquement" };
    }
  }
}
