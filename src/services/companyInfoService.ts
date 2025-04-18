
import { Company } from "@/types";
import { toast } from "sonner";
import { 
  OPENAI_API_KEY,
  COMPANY_INFO_PROMPT,
  COMPANY_INFO_MODEL,
  DEFAULT_COMPANY_INFO_PROMPT,
  DEFAULT_COMPANY_INFO_MODEL
} from "@/context/constants";

/**
 * Service for auto-completing company information using OpenAI
 */
export async function fetchCompanyInfo(companyName: string): Promise<Partial<Company> | null> {
  try {
    const apiKey = localStorage.getItem(OPENAI_API_KEY);
    if (!apiKey) {
      toast.error("Clé API OpenAI non configurée", {
        description: "Veuillez configurer votre clé API dans les paramètres"
      });
      return null;
    }
    
    // Get the prompt and model from localStorage or use defaults
    const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || DEFAULT_COMPANY_INFO_PROMPT;
    const model = localStorage.getItem(COMPANY_INFO_MODEL) || DEFAULT_COMPANY_INFO_MODEL;
    
    // Format prompt by replacing placeholder with company name
    const formattedPrompt = prompt.replace("{{company_name}}", companyName);
    
    // Show loading toast
    toast.loading("Recherche d'informations...", {
      description: `Recherche de données pour ${companyName}`,
      id: "company-info-loading"
    });
    
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        input: [
          { role: "user", content: formattedPrompt }
        ],
        responseFormat: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const companyInfo = JSON.parse(content);
    
    // Update toast
    toast.success("Informations trouvées", {
      description: `Données récupérées pour ${companyName}`,
      id: "company-info-loading"
    });
    
    return companyInfo;
  } catch (error) {
    console.error("Erreur lors de la récupération des informations:", error);
    toast.error("Échec de la recherche", {
      description: `Impossible de trouver des informations pour cette entreprise: ${(error as Error).message}`,
      id: "company-info-loading"
    });
    return null;
  }
}
