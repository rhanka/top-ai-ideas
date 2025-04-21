
import { COMPANY_INFO_PROMPT, COMPANY_INFO_MODEL } from "@/context/constants";
import { OpenAIService } from "./OpenAIService";
import { defaultBusinessConfig } from '@/data/defaultBusinessConfig';

interface CompanyInfo {
  industry: string;
  size: string;
  products: string;
  processes: string;
  challenges: string;
  objectives: string;
  technologies: string;
}

// Helper function to find the best matching sector
function findBestMatchingSector(input: string): string {
  // First try to find an exact match
  const exactMatch = defaultBusinessConfig.sectors.find(
    sector => sector.name.toLowerCase() === input.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch.id;
  }
  
  // If no exact match, find the sector that contains our input or vice versa
  for (const sector of defaultBusinessConfig.sectors) {
    if (
      sector.name.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(sector.name.toLowerCase())
    ) {
      return sector.id;
    }
  }
  
  // Default to first sector if no match is found
  return defaultBusinessConfig.sectors[0].id;
}

export async function fetchCompanyInfoByName(companyName: string): Promise<CompanyInfo> {
  // Récupérer la clé API OpenAI
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("Clé API OpenAI non configurée");
  }

  // Récupérer le prompt personnalisé ou utiliser un par défaut
  const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || 
    "Recherchez et fournissez des informations complètes sur l'entreprise {{company_name}}. " + 
    "Les secteurs d'activité disponibles sont: " + defaultBusinessConfig.sectors.map(s => s.name).join(', ') + ". " +
    "Retournez les informations UNIQUEMENT au format JSON suivant:\n" +
    "{\n" +
    '  "industry": "Secteur d\'activité principal",\n' +
    '  "size": "Taille en nombre d\'employés et chiffre d\'affaires si disponible",\n' +
    '  "products": "Description détaillée des principaux produits ou services",\n' +
    '  "processes": "Description des processus métier clés",\n' +
    '  "challenges": "Défis principaux auxquels l\'entreprise est confrontée actuellement",\n' +
    '  "objectives": "Objectifs stratégiques connus de l\'entreprise",\n' +
    '  "technologies": "Technologies ou systèmes d\'information déjà utilisés"\n' +
    "}\n\n" +
    "IMPORTANT: Pour industry, la valeur retournée doit être STRICTEMENT l'un des éléments suivants : " + 
    defaultBusinessConfig.sectors.map(s => s.name).join(', ');
  
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
      input: formattedPrompt, // Input as a simple string
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
          const companyInfo = JSON.parse(jsonStr);
          
          // Traitement spécial pour le champ "industry"
          let industryValue = companyInfo.industry;
          // Vérifier si le secteur d'activité est valide, sinon trouver le meilleur correspondant
          const sectorIds = defaultBusinessConfig.sectors.map(s => s.id);
          const sectorNames = defaultBusinessConfig.sectors.map(s => s.name);
          
          if (!sectorNames.includes(industryValue)) {
            // Si l'industrie n'est pas dans la liste des noms de secteur, essayer de trouver un secteur correspondant
            const bestMatch = findBestMatchingSector(industryValue);
            const matchedSector = defaultBusinessConfig.sectors.find(s => s.id === bestMatch);
            industryValue = matchedSector ? matchedSector.id : defaultBusinessConfig.sectors[0].id;
          } else {
            // Si l'industrie est dans la liste des noms, trouver l'ID correspondant
            const matchedSector = defaultBusinessConfig.sectors.find(s => s.name === industryValue);
            industryValue = matchedSector ? matchedSector.id : defaultBusinessConfig.sectors[0].id;
          }
          
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
          
          // Valider que tous les champs requis existent
          return {
            industry: industryValue,
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
        throw new Error("Contenu de la réponse manquant ou format inattendu");
      }
    } else {
      throw new Error("Réponse vide ou format inattendu");
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API OpenAI:", error);
    throw new Error(`Erreur lors de la récupération des informations: ${(error as Error).message}`);
  }
}
