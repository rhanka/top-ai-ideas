
import axios from 'axios';

type OpenAIParams = {
  model: string;
  messages?: { role: string; content: string }[];
  input?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: { type: string }[];
  tool_choice?: string | object;
};

/**
 * Service for interacting with the OpenAI API
 */
export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Makes a request to the OpenAI API
   */
  async makeApiRequest(params: OpenAIParams) {
    try {
      // Determine which endpoint to use based on parameters
      let endpoint = 'https://api.openai.com/v1/chat/completions';
      let requestData: any = { ...params };
      
      // If input is provided directly instead of messages array, convert it
      if (!params.messages && params.input) {
        // For the completion endpoint with tools
        if (params.tools) {
          endpoint = 'https://api.openai.com/v1/chat/completions';
          requestData.messages = [{ role: "user", content: params.input }];
          delete requestData.input;
        } else {
          // For the legacy completions endpoint
          endpoint = 'https://api.openai.com/v1/completions';
          requestData.prompt = params.input;
          delete requestData.input;
        }
      }
      
      const response = await axios.post(
        endpoint,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (endpoint.includes('chat/completions')) {
        if (params.tools) {
          // Handle structured response with tools
          return {
            output: response.data.choices[0].message.tool_calls || 
                   response.data.choices[0].message.content || 
                   response.data.choices[0].message
          };
        } else {
          // Handle normal chat completion response
          return {
            text: response.data.choices[0].message.content
          };
        }
      } else {
        // Handle legacy completion response
        return {
          text: response.data.choices[0].text
        };
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Generates folder name and description from user input
   */
  async generateFolderNameAndDescription(
    input: string,
    prompt: string,
    model: string,
    currentCompany?: any
  ) {
    try {
      // Format the prompt with user input and company context if available
      let formattedPrompt = prompt.replace('{{user_input}}', input);
      
      if (currentCompany) {
        formattedPrompt += `\nContexte de l'entreprise: ${currentCompany.name}, Secteur: ${currentCompany.industry}, Défis: ${currentCompany.challenges}`;
      }

      const response = await this.makeApiRequest({
        model: model,
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.7
      });

      if (!response || !response.text) {
        throw new Error("Réponse vide ou format inattendu");
      }

      // Parse the response to extract folder name and description
      let name = "";
      let description = "";

      try {
        // Try to parse as JSON first
        const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/) || 
                          response.text.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const jsonContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
          const parsedResponse = JSON.parse(jsonContent);
          name = parsedResponse.name || parsedResponse.folderName || "";
          description = parsedResponse.description || "";
        } else {
          // Extract name and description from text format
          const nameMatch = response.text.match(/nom[:\s]+(.*?)(?:\n|$)/i);
          const descMatch = response.text.match(/description[:\s]+(.*?)(?:\n|$)/i);
          name = nameMatch ? nameMatch[1].trim() : "Nouveau dossier";
          description = descMatch ? descMatch[1].trim() : "";
        }
      } catch (error) {
        console.error("Erreur d'analyse de la réponse:", error);
        name = "Nouveau dossier";
        description = input.substring(0, 100);
      }

      return { name, description };
    } catch (error) {
      console.error("Erreur de génération du nom de dossier:", error);
      return { 
        name: "Nouveau dossier", 
        description: input.substring(0, 100) 
      };
    }
  }

  /**
   * Generates a list of use case titles based on user input
   */
  async generateUseCaseList(
    input: string,
    prompt: string,
    model: string,
    currentCompany?: any
  ): Promise<string[]> {
    try {
      // Format the prompt with user input and company context if available
      let formattedPrompt = prompt.replace('{{user_input}}', input);
      
      if (currentCompany) {
        formattedPrompt += `\nContexte de l'entreprise: ${currentCompany.name}, Secteur: ${currentCompany.industry}, Défis: ${currentCompany.challenges}`;
      }

      const response = await this.makeApiRequest({
        model: model,
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.8
      });

      if (!response || !response.text) {
        throw new Error("Réponse vide ou format inattendu");
      }

      // Parse the response to extract use case titles
      let useCaseTitles: string[] = [];

      try {
        // Try to parse as JSON first
        const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/) || 
                          response.text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const jsonContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
          const parsedResponse = JSON.parse(jsonContent);
          
          // Extract titles based on response format
          if (Array.isArray(parsedResponse)) {
            useCaseTitles = parsedResponse.map(item => 
              typeof item === 'string' ? item : item.title || item.name || ''
            ).filter(title => title);
          } else if (parsedResponse.useCases && Array.isArray(parsedResponse.useCases)) {
            useCaseTitles = parsedResponse.useCases.map(item => 
              typeof item === 'string' ? item : item.title || item.name || ''
            ).filter(title => title);
          }
        } else {
          // Parse from text format (numbered or bulleted list)
          const lines = response.text.split('\n').map(line => line.trim());
          useCaseTitles = lines
            .filter(line => /^[0-9]+[\.\)]\s+|^[-*]\s+/.test(line))
            .map(line => line.replace(/^[0-9]+[\.\)]\s+|^[-*]\s+/, '').trim());
        }
      } catch (error) {
        console.error("Erreur d'analyse de la réponse:", error);
        return [];
      }

      return useCaseTitles;
    } catch (error) {
      console.error("Erreur de génération de la liste des cas d'usage:", error);
      return [];
    }
  }

  /**
   * Generates detailed use case content
   */
  async generateUseCaseDetail(
    title: string,
    context: string,
    matrixConfig: any,
    prompt: string,
    model: string,
    currentCompany?: any
  ) {
    try {
      // Format the prompt with title, context, and matrix config
      let formattedPrompt = prompt
        .replace('{{use_case}}', title)
        .replace('{{user_input}}', context)
        .replace('{{matrix}}', JSON.stringify(matrixConfig, null, 2));
      
      if (currentCompany) {
        formattedPrompt += `\nContexte de l'entreprise: ${currentCompany.name}, Secteur: ${currentCompany.industry}, Défis: ${currentCompany.challenges}`;
      }

      const response = await this.makeApiRequest({
        model: model,
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.7
      });

      if (!response || !response.text) {
        throw new Error("Réponse vide ou format inattendu");
      }

      // Parse the response to extract use case details
      try {
        // Extract JSON content from the response
        const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/) || 
                          response.text.match(/{[\s\S]*}/);
        
        if (!jsonMatch) {
          throw new Error("Format JSON non trouvé dans la réponse");
        }
        
        const jsonContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
        const useCaseDetail = JSON.parse(jsonContent);
        
        // Ensure required fields are present
        return {
          title: useCaseDetail.title || title,
          description: useCaseDetail.description || "",
          valueRatings: useCaseDetail.valueRatings || {},
          complexityRatings: useCaseDetail.complexityRatings || {},
          valueScore: 0,  // Will be calculated later
          complexityScore: 0, // Will be calculated later
          valueLevel: "medium", // Will be calculated later
          complexityLevel: "medium", // Will be calculated later
          implementationSteps: useCaseDetail.implementationSteps || [],
          expectedBenefits: useCaseDetail.expectedBenefits || [],
          technicalRequirements: useCaseDetail.technicalRequirements || []
        };
      } catch (error) {
        console.error("Erreur d'analyse de la réponse:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erreur de génération du détail du cas d'usage:", error);
      throw error;
    }
  }

  /**
   * Finalizes the generation process with success/failure tracking
   */
  finalizeGeneration(success: boolean, count: number) {
    // This method could be used for analytics, logging or other post-processing
    if (success) {
      console.log(`Génération terminée avec succès: ${count} cas d'usage générés`);
    } else {
      console.error("Échec de la génération des cas d'usage");
    }
  }
}
