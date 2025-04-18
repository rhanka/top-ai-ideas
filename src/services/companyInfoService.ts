
import { Company } from "@/types";
import { 
  OPENAI_API_KEY, 
  COMPANY_INFO_PROMPT, 
  DEFAULT_COMPANY_INFO_PROMPT,
  COMPANY_INFO_MODEL,
  DEFAULT_COMPANY_INFO_MODEL
} from "@/context/constants";
import { toast } from "sonner";

export const fetchCompanyInfoByName = async (name: string): Promise<Company | null> => {
  const apiKey = localStorage.getItem(OPENAI_API_KEY);
  
  if (!apiKey) {
    toast.error("Clé API OpenAI non configurée", {
      description: "Veuillez configurer votre clé API dans les paramètres",
      action: {
        label: "Paramètres",
        onClick: () => window.location.href = "/parametres",
      },
    });
    return null;
  }
  
  const model = localStorage.getItem(COMPANY_INFO_MODEL) || DEFAULT_COMPANY_INFO_MODEL;
  const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || DEFAULT_COMPANY_INFO_PROMPT;
  
  // Replace placeholder in prompt
  const formattedPrompt = prompt.replace("{{company_name}}", name);
  
  const loadingToast = toast.loading("Recherche d'informations sur l'entreprise...");
  
  try {
    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: formattedPrompt }
        ],
        temperature: 0.3,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error (${response.status})`);
    }
    
    const result = await response.json();
    
    // Parse the JSON response from the completion
    let jsonContent;
    if (result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
      try {
        // Try to parse the JSON response
        const content = result.choices[0].message.content.trim();
        jsonContent = JSON.parse(content);
      } catch (parseError) {
        console.error("Error parsing JSON from OpenAI response:", parseError);
        throw new Error("Le contenu retourné n'est pas un JSON valide");
      }
    } else {
      throw new Error("Format de réponse inattendu de l'API OpenAI");
    }
    
    toast.success("Informations sur l'entreprise récupérées", { id: loadingToast });
    
    // Return the company info with the name added
    return {
      name,
      industry: jsonContent.industry || "",
      size: jsonContent.size || "",
      products: jsonContent.products || "",
      processes: jsonContent.processes || "",
      challenges: jsonContent.challenges || "",
      objectives: jsonContent.objectives || "",
      technologies: jsonContent.technologies || "",
    };
  } catch (error) {
    console.error("Error fetching company info:", error);
    toast.error(`Erreur: ${(error as Error).message}`, { id: loadingToast });
    return null;
  }
};

// Alias for backward compatibility
export const fetchCompanyInfo = fetchCompanyInfoByName;
