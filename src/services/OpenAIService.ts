
import { toast } from "sonner";
import { UseCase, MatrixConfig } from "../types";

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateUseCaseList(userInput: string, prompt: string): Promise<string[]> {
    try {
      const formattedPrompt = prompt.replace("{{user_input}}", userInput);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: formattedPrompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        throw new Error(error.error?.message || "Failed to generate use cases");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse the numbered list to extract use case titles
      const useCases = content
        .split("\n")
        .filter((line: string) => /^\d+\./.test(line.trim()))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      return useCases;
    } catch (error) {
      console.error("Error generating use case list:", error);
      throw error;
    }
  }

  async generateUseCaseDetail(
    useCase: string,
    userInput: string,
    matrixConfig: MatrixConfig,
    prompt: string
  ): Promise<UseCase> {
    try {
      // Create a simplified matrix representation for the prompt
      const matrixSummary = {
        valueAxes: matrixConfig.valueAxes.map((axis) => ({
          name: axis.name,
          description: axis.description,
        })),
        complexityAxes: matrixConfig.complexityAxes.map((axis) => ({
          name: axis.name,
          description: axis.description,
        })),
      };

      const formattedPrompt = prompt
        .replace("{{use_case}}", useCase)
        .replace("{{user_input}}", userInput)
        .replace("{{matrix}}", JSON.stringify(matrixSummary, null, 2));

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: formattedPrompt }],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        throw new Error(error.error?.message || "Failed to generate use case detail");
      }

      const data = await response.json();
      const jsonContent = JSON.parse(data.choices[0].message.content);

      // Generate a unique ID for the use case
      const id = `ID${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

      // Ensure all required fields are present
      return {
        id,
        name: jsonContent.name || useCase,
        domain: jsonContent.domain || "",
        description: jsonContent.description || "",
        technology: jsonContent.technology || "",
        deadline: jsonContent.deadline || "",
        contact: jsonContent.contact || "",
        benefits: jsonContent.benefits || [],
        metrics: jsonContent.metrics || [],
        risks: jsonContent.risks || [],
        nextSteps: jsonContent.nextSteps || [],
        sources: jsonContent.sources || [],
        relatedData: jsonContent.relatedData || [],
        valueScores: jsonContent.valueScores || [],
        complexityScores: jsonContent.complexityScores || [],
      };
    } catch (error) {
      console.error("Error generating use case detail:", error);
      throw error;
    }
  }
}
