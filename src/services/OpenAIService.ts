import OpenAI from 'openai';
import { UseCase, MatrixConfig, Company } from '../types';
import { RequestQueueService } from './queue/RequestQueueService';

export class OpenAIService {
  private openai: OpenAI;
  private queue: RequestQueueService<any>;

  constructor(apiKey: string, concurrency: number = 5) {
    this.openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
    this.queue = new RequestQueueService<any>(concurrency);
  }

  public setConcurrency(concurrency: number): void {
    this.queue.setConcurrency(concurrency);
  }

  public getQueueLength(): number {
    return this.queue.getQueueLength();
  }

  public getRunningCount(): number {
    return this.queue.getRunningCount();
  }

  public getTotalCount(): number {
    return this.queue.getTotalCount();
  }

  private async generate(prompt: string, model: string): Promise<string> {
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
      });
      return chatCompletion.choices[0].message.content || '';
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }

  async generateUseCaseList(userInput: string, promptTemplate: string, model: string, company?: Company): Promise<string[]> {
    const prompt = this.populatePrompt(promptTemplate, { user_input: userInput, company: company ? JSON.stringify(company) : 'N/A' });

    return new Promise((resolve, reject) => {
      this.queue.enqueue({
        id: `list-${Date.now()}`,
        execute: () => this.generate(prompt, model),
        onSuccess: (response: string) => {
          const useCaseTitles = response.split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(title => title.length > 0);
          resolve(useCaseTitles);
        },
        onError: (error: Error) => {
          console.error("List generation failed:", error);
          reject(error);
        },
        onStart: () => console.log("Starting list generation...")
      });
    });
  }

  async generateUseCaseDetail(
    useCaseTitle: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    promptTemplate: string,
    model: string,
    company?: Company
  ): Promise<UseCase> {
    const matrix = JSON.stringify(matrixConfig);
    const prompt = this.populatePrompt(promptTemplate, {
      use_case: useCaseTitle,
      user_input: userInput,
      matrix: matrix,
      company: company ? JSON.stringify(company) : 'N/A'
    });

    return new Promise((resolve, reject) => {
      this.queue.enqueue({
        id: `detail-${Date.now()}`,
        execute: () => this.generate(prompt, model),
        onSuccess: (response: string) => {
          try {
            const useCaseDetail = JSON.parse(response);
            resolve({ name: useCaseTitle, ...useCaseDetail });
          } catch (parseError) {
            console.error("JSON parsing failed:", parseError);
            reject(parseError);
          }
        },
        onError: (error: Error) => {
          console.error("Detail generation failed:", error);
          reject(error);
        },
        onStart: () => console.log(`Starting detail generation for ${useCaseTitle}...`)
      });
    });
  }

  async generateFolderNameAndDescription(userInput: string, promptTemplate: string, model: string, company?: Company): Promise<{ name: string, description: string }> {
    const prompt = this.populatePrompt(promptTemplate, { user_input: userInput, company: company ? JSON.stringify(company) : 'N/A' });

    return new Promise((resolve, reject) => {
      this.queue.enqueue({
        id: `folder-${Date.now()}`,
        execute: () => this.generate(prompt, model),
        onSuccess: (response: string) => {
          try {
            const folderInfo = JSON.parse(response);
            resolve({ name: folderInfo.name, description: folderInfo.description });
          } catch (parseError) {
            console.error("JSON parsing failed:", parseError);
            reject(parseError);
          }
        },
        onError: (error: Error) => {
          console.error("Folder generation failed:", error);
          reject(error);
        },
        onStart: () => console.log("Starting folder generation...")
      });
    });
  }

  finalizeGeneration(success: boolean, successCount: number): void {
    if (success) {
      console.log(`Successfully generated ${successCount} use cases.`);
    } else {
      console.warn("No use cases were successfully generated.");
    }
  }

  private populatePrompt(template: string, data: { [key: string]: string }): string {
    let prompt = template;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
      }
    }
    return prompt;
  }
}
