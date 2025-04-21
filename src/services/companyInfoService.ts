import { Company } from "../types";
import { toast } from "sonner";
import { 
  COMPANY_INFO_PROMPT, 
  DEFAULT_COMPANY_INFO_PROMPT,
  COMPANY_INFO_MODEL,
  DEFAULT_COMPANY_INFO_MODEL,
  OPENAI_API_KEY
} from "../context/constants";

export async function fetchCompanyInfo(companyName: string): Promise<Company | null> {
  try {
    // Get OpenAI API key from localStorage
    const apiKey = localStorage.getItem(OPENAI_API_KEY);
    if (!apiKey) {
      toast.error("Clé API OpenAI non configurée", {
        description: "Veuillez configurer votre clé API dans les paramètres",
      });
      return null;
    }

    // Get prompt from localStorage or use default
    const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || DEFAULT_COMPANY_INFO_PROMPT;
    
    // Get model from localStorage or use default
    const model = localStorage.getItem(COMPANY_INFO_MODEL) || DEFAULT_COMPANY_INFO_MODEL;
    
    // Replace placeholder in prompt
    const formattedPrompt = prompt.replace("{{company_name}}", companyName);

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error (${response.status})`);
    }

    const data = await response.json();
    
    // Type safety: Check if data has the expected structure
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Unexpected response format from OpenAI API");
    }

    const content = data.choices[0].message.content;
    
    // Extract JSON from the response (it may be wrapped in markdown code blocks)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/{[\s\S]*?}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from OpenAI response");
    }

    const jsonStr = jsonMatch[0].replace(/```json\s*/, "").replace(/\s*```/, "");
    const companyInfo = JSON.parse(jsonStr);
    
    return {
      id: Date.now().toString(),
      name: companyInfo.name || companyName,
      industry: companyInfo.industry || "",
      size: companyInfo.size || "",
      products: companyInfo.products || "",
      processes: companyInfo.processes || "",
      challenges: companyInfo.challenges || "",
      objectives: companyInfo.objectives || "",
      technologies: companyInfo.technologies || "",
    };
  } catch (error) {
    console.error("Error fetching company info:", error);
    toast.error("Erreur lors de la récupération des informations de l'entreprise");
    return null;
  }
}
