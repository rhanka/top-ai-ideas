
import { UseCase } from '../types';
import { toast } from 'sonner';

export interface UseCaseDetailResponse {
  name: string;
  description: string;
  domain: string;
  technology: string;
  deadline: string;
  contact: string;
  benefits: string[];
  metrics: string[];
  risks: string[];
  nextSteps: string[];
  sources: string[];
  relatedData: string[];
  valueScores: any[];
  complexityScores: any[];
}

export class OpenAIService {
  private apiKey: string;
  private abortController: AbortController | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateUseCaseList(userInput: string, prompt: string): Promise<string[]> {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Vous êtes un assistant qui aide à identifier les cas d'usage pertinents pour l'intelligence artificielle."
            },
            {
              role: "user",
              content: prompt.replace("{{user_input}}", userInput)
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
        signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract numbered items
      const regex = /^\d+\.\s(.+)$/gm;
      const matches = [...content.matchAll(regex)];
      const useCaseTitles = matches.map(match => match[1].trim());
      
      return useCaseTitles;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Request was aborted');
        return [];
      }
      console.error('Error generating use case list:', error);
      throw error;
    }
  }
  
  public async generateUseCaseDetail(
    useCaseTitle: string, 
    userInput: string, 
    matrixConfig: any,
    prompt: string
  ): Promise<UseCase> {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    try {
      // Prepare a simplified matrix for the prompt
      const simplifiedMatrix = {
        valueAxes: matrixConfig.valueAxes.map((axis: any) => ({
          name: axis.name,
          description: axis.description
        })),
        complexityAxes: matrixConfig.complexityAxes.map((axis: any) => ({
          name: axis.name,
          description: axis.description
        }))
      };
      
      // Format the prompt with the use case title, user input, and simplified matrix
      const formattedPrompt = prompt
        .replace("{{use_case}}", useCaseTitle)
        .replace("{{user_input}}", userInput)
        .replace("{{matrix}}", JSON.stringify(simplifiedMatrix));
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Vous êtes un assistant qui aide à créer des cas d'usage détaillés pour l'intelligence artificielle. Répondez uniquement avec un objet JSON valide selon le format demandé."
            },
            {
              role: "user",
              content: formattedPrompt
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
          max_tokens: 2000
        }),
        signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const useCaseDetail = JSON.parse(content);
        
        return {
          id: `uc_${Date.now()}`,
          name: useCaseDetail.name,
          domain: useCaseDetail.domain,
          description: useCaseDetail.description,
          technology: useCaseDetail.technology,
          deadline: useCaseDetail.deadline,
          contact: useCaseDetail.contact,
          benefits: useCaseDetail.benefits,
          metrics: useCaseDetail.metrics,
          risks: useCaseDetail.risks,
          nextSteps: useCaseDetail.nextSteps,
          sources: useCaseDetail.sources,
          relatedData: useCaseDetail.relatedData,
          valueScores: useCaseDetail.valueScores,
          complexityScores: useCaseDetail.complexityScores,
          folderId: '' // This will be set by the calling function
        };
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Request was aborted');
        throw new Error('Request was aborted');
      }
      console.error('Error generating use case detail:', error);
      throw error;
    }
  }
  
  public finalizeGeneration(success: boolean, count: number): void {
    if (success) {
      toast.success(`${count} cas d'usage générés avec succès`);
    } else {
      toast.error("Échec de la génération des cas d'usage");
    }
    
    this.abortController = null;
  }
}
