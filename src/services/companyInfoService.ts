import { COMPANY_INFO_PROMPT, COMPANY_INFO_MODEL } from "@/context/constants";
import { OpenAIService } from "./OpenAIService";
import { BusinessSector } from "@/types/business";

interface CompanyInfo {
  industry: string;
  size: string;
  products: string;
  processes: string;
  challenges: string;
  objectives: string;
  technologies: string;
}

export async function fetchCompanyInfoByName(
  companyName: string, 
  sectors: BusinessSector[]
): Promise<CompanyInfo> {
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("Clé API OpenAI non configurée");
  }

  const sectorsPrompt = JSON.stringify(sectors.map(s => ({
    id: s.id,
    name: s.name
  })));

  const prompt = `Analysez l'entreprise ${companyName} et fournissez les informations suivantes au format JSON:
  {
    "industry": "Description du secteur d'activité",
    "sectorId": "ID du secteur correspondant parmi cette liste: ${sectorsPrompt}",
    "size": "Taille (employés et CA)",
    "products": "Produits/services principaux",
    "processes": "Liste des processus métier clés",
    "challenges": "Défis actuels",
    "objectives": "Objectifs stratégiques",
    "technologies": "Technologies utilisées"
  }
  
  Assurez-vous que le sectorId correspond à l'un des secteurs fournis.`;

  const model = localStorage.getItem(COMPANY_INFO_MODEL) || "gpt-4o";
  const openai = new OpenAIService(apiKey);

  try {
    const response = await openai.makeApiRequest({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    if (response && response.output && response.output.length > 0) {
      const messageOutput = response.output.find(item => item.type === "message");
      
      if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
        const contentText = messageOutput.content[0].text;
        
        try {
          const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : contentText;
          const companyInfo = JSON.parse(jsonStr);
          
          let sizeValue = companyInfo.size;
          if (typeof sizeValue === 'object' && sizeValue !== null) {
            if (sizeValue.employees) {
              const employees = sizeValue.employees || 'Non spécifié';
              const revenue = sizeValue.revenue || '';
              sizeValue = employees + (revenue ? ` - ${revenue}` : '');
            } else {
              sizeValue = JSON.stringify(sizeValue);
            }
          }
          
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
