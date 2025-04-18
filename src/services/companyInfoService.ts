
import { COMPANY_INFO_PROMPT, COMPANY_INFO_MODEL } from "@/context/constants";
import { OpenAIService } from "./OpenAIService";

interface CompanyInfo {
  industry: string;
  size: string;
  products: string;
  processes: string;
  challenges: string;
  objectives: string;
  technologies: string;
}

export async function fetchCompanyInfoByName(companyName: string): Promise<CompanyInfo> {
  // Récupérer la clé API OpenAI
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("Clé API OpenAI non configurée");
  }

  // Récupérer le prompt personnalisé ou utiliser un par défaut
  const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || 
    "Recherchez et fournissez des informations sur l'entreprise {{company_name}}. Retournez les informations au format JSON avec les champs suivants: industry (secteur d'activité), size (taille en employés et CA si disponible), products (produits ou services principaux), processes (processus métier clés), challenges (défis actuels), objectives (objectifs stratégiques), technologies (technologies déjà utilisées).";
  
  // Récupérer le modèle configuré
  const model = localStorage.getItem(COMPANY_INFO_MODEL) || "gpt-4o";

  // Créer l'instance du service OpenAI
  const openai = new OpenAIService(apiKey);

  try {
    // Formater le prompt avec le nom de l'entreprise
    const formattedPrompt = prompt.replace('{{company_name}}', companyName);

    // Appeler l'API OpenAI avec la recherche web activée
    const response = await openai.makeApiRequest({
      model: model,
      input: {
        messages: [
          {
            role: "user",
            content: formattedPrompt
          }
        ]
      },
      tools: [{ 
        type: "web_search_preview" 
      }],
      tool_choice: "auto",
      temperature: 0.7
      // max_tokens parameter removed as it's not supported in the Responses API
    });

    // Analyser la réponse
    if (response && response.choices && response.choices[0]?.message?.content) {
      const content = response.choices[0].message.content;
      
      try {
        // Extraire le JSON de la réponse
        const jsonMatch = content.match(/({[\s\S]*})/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const companyInfo = JSON.parse(jsonStr);
        
        // Traitement spécial pour le champ "size" s'il est un objet
        let sizeValue = companyInfo.size;
        if (typeof sizeValue === 'object' && sizeValue !== null) {
          // Si size est un objet, le formater en chaîne de caractères
          const employees = sizeValue.employees || 'Non spécifié';
          const revenue = sizeValue.revenue || '';
          sizeValue = employees + (revenue ? ` - ${revenue}` : '');
        }
        
        // Valider que tous les champs requis existent
        return {
          industry: companyInfo.industry || "",
          size: typeof sizeValue === 'string' ? sizeValue : String(sizeValue || ""),
          products: companyInfo.products || "",
          processes: companyInfo.processes || "",
          challenges: companyInfo.challenges || "",
          objectives: companyInfo.objectives || "",
          technologies: companyInfo.technologies || ""
        };
      } catch (error) {
        console.error("Erreur lors du parsing JSON:", error);
        throw new Error("Format de réponse invalide");
      }
    } else {
      throw new Error("Réponse vide ou format inattendu");
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API OpenAI:", error);
    throw new Error(`Erreur lors de la récupération des informations: ${(error as Error).message}`);
  }
}
