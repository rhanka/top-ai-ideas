import { COMPANY_INFO_PROMPT, COMPANY_INFO_MODEL } from "@/context/constants";
import { OpenAIService } from "./OpenAIService";
import { defaultBusinessConfig } from "@/data/defaultBusinessConfig";

interface CompanyInfo {
  normalizedName?: string;
  industry: string;
  size: string;
  products: string;
  processes: string;
  challenges: string;
  objectives: string;
  technologies: string;
}

/**
 * Trouve l'ID du secteur correspondant au nom du secteur
 * @param sectorName Nom du secteur
 * @returns ID du secteur ou le nom lui-même si non trouvé
 */
function getSectorIdFromName(sectorName: string): string {
  // Recherche le secteur par son nom exact (insensible à la casse)
  const sector = defaultBusinessConfig.sectors.find(
    s => s.name.toLowerCase() === sectorName.toLowerCase()
  );
  
  // Si trouvé, retourne l'ID, sinon cherche une correspondance partielle
  if (sector) {
    return sector.id;
  }
  
  // Recherche une correspondance partielle
  const partialMatch = defaultBusinessConfig.sectors.find(
    s => sectorName.toLowerCase().includes(s.name.toLowerCase()) || 
         s.name.toLowerCase().includes(sectorName.toLowerCase())
  );
  
  // Si une correspondance partielle est trouvée, retourne son ID
  if (partialMatch) {
    return partialMatch.id;
  }
  
  // Si aucun secteur correspondant n'est trouvé, retourne le premier secteur comme fallback
  return defaultBusinessConfig.sectors.length > 0 ? defaultBusinessConfig.sectors[0].id : '';
}

export async function fetchCompanyInfoByName(companyName: string, maxRetries: number = 1): Promise<CompanyInfo> {
  // Récupérer la clé API OpenAI
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("Clé API OpenAI non configurée");
  }

  // Construire la liste des secteurs pour le prompt
  const sectorsList = defaultBusinessConfig.sectors.map(s => s.name).join(', ');

  // Récupérer le prompt personnalisé ou utiliser un par défaut
  const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || 
    "Recherchez et fournissez des informations complètes sur l'entreprise {{company_name}}. \nLes secteurs d'activité disponibles sont: {{secteurs}}.\nNormalisez le nom de l'entreprise selon son usage officiel.\n\nRetournez les informations UNIQUEMENT au format JSON suivant:\n{\n  \"normalizedName\": \"Nom normalisé de l'entreprise\",\n  \"industry\": \"Secteur d'activité (DOIT correspondre à un des secteurs listés)\",\n  \"size\": \"Taille en nombre d'employés et chiffre d'affaires si disponible\",\n  \"products\": \"Description détaillée des principaux produits ou services\",\n  \"processes\": \"Description des processus métier clés\",\n  \"challenges\": \"Défis principaux auxquels l'entreprise est confrontée actuellement\",\n  \"objectives\": \"Objectifs stratégiques connus de l'entreprise\",\n  \"technologies\": \"Technologies ou systèmes d'information déjà utilisés\"\n}";
  
  // Récupérer le modèle configuré
  const model = localStorage.getItem(COMPANY_INFO_MODEL) || "gpt-4o";

  // Créer l'instance du service OpenAI
  const openai = new OpenAIService(apiKey);

  async function attemptFetch(retriesLeft: number): Promise<CompanyInfo> {
    try {
      // Formater le prompt avec le nom de l'entreprise et la liste des secteurs
      let formattedPrompt = prompt.replace('{{company_name}}', companyName);
      formattedPrompt = formattedPrompt.replace('{{secteurs}}', sectorsList);

      // Appeler l'API OpenAI avec la recherche web activée
      const response = await openai.makeApiRequest({
        model: model,
        input: formattedPrompt, 
        tools: [{ 
          type: "web_search_preview" 
        }],
        tool_choice: "auto",
        temperature: 0.7
      });

      // Analyser la réponse
      if (response && response.output && response.output.length > 0) {
        // Chercher le message généré par l'assistant (type "message")
        const messageOutput = response.output.find(item => item.type === "message");
        
        if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
          const contentText = messageOutput.content[0].text;
          
          try {
            // Extraire le JSON de la réponse (entre les backticks ```json et ```)
            const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : contentText;
            
            // Nettoyer le JSON avant de le parser (enlever les caractères non-imprimables)
            const cleanJsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
            const companyInfo = JSON.parse(cleanJsonStr);
            
            // Traitement spécial pour le champ "size" s'il est un objet
            let sizeValue = companyInfo.size;
            if (typeof sizeValue === 'object' && sizeValue !== null) {
              // Si size est un objet, le formater en chaîne de caractères
              if (sizeValue.employees) {
                const employees = sizeValue.employees || 'Non spécifié';
                const revenue = sizeValue.revenue || '';
                sizeValue = employees + (revenue ? ` - ${revenue}` : '');
              } else {
                sizeValue = JSON.stringify(sizeValue);
              }
            }
            
            // Convertir le nom du secteur en ID de secteur
            const industryId = getSectorIdFromName(companyInfo.industry);
            
            // Valider que tous les champs requis existent
            return {
              normalizedName: companyInfo.normalizedName || companyName,
              industry: industryId,
              size: typeof sizeValue === 'string' ? sizeValue : String(sizeValue || ""),
              products: companyInfo.products || "",
              processes: companyInfo.processes || "",
              challenges: companyInfo.challenges || "",
              objectives: companyInfo.objectives || "",
              technologies: companyInfo.technologies || ""
            };
          } catch (error) {
            // Si parsing échoue et qu'il reste des tentatives, réessayer
            if (retriesLeft > 0) {
              console.warn("Erreur de parsing JSON, nouvelle tentative...");
              return attemptFetch(retriesLeft - 1);
            }
            console.error("Erreur lors du parsing JSON:", error);
            throw new Error("Format de réponse invalide");
          }
        } else {
          // Si pas de contenu et qu'il reste des tentatives, réessayer
          if (retriesLeft > 0) {
            console.warn("Contenu de la réponse manquant, nouvelle tentative...");
            return attemptFetch(retriesLeft - 1);
          }
          throw new Error("Contenu de la réponse manquant ou format inattendu");
        }
      } else {
        // Si pas de réponse et qu'il reste des tentatives, réessayer
        if (retriesLeft > 0) {
          console.warn("Réponse vide, nouvelle tentative...");
          return attemptFetch(retriesLeft - 1);
        }
        throw new Error("Réponse vide ou format inattendu");
      }
    } catch (error) {
      // Si une erreur survient et qu'il reste des tentatives, réessayer
      if (retriesLeft > 0) {
        console.warn("Erreur lors de l'appel, nouvelle tentative...");
        return attemptFetch(retriesLeft - 1);
      }
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      throw new Error(`Erreur lors de la récupération des informations: ${(error as Error).message}`);
    }
  }

  // Commencer avec le nombre maximal de réessais
  return attemptFetch(maxRetries);
}
