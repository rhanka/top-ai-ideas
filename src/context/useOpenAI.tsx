import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { apiKeySettings } from "./constants";
import OpenAIService from "../services/OpenAIService";
import { Company } from "@/types";

// On utilise maintenant OpenAIService importé par défaut
import { MatrixConfig, UseCase, Folder } from "@/types";

interface OpenAIHook {
  isGenerating: boolean;
  generateUseCases: (input: string, createNewFolder: boolean) => Promise<boolean>;
}

export const useOpenAI = (
  matrixConfig: MatrixConfig,
  addUseCase: (useCase: UseCase) => void,
  addFolder: (name: string, description: string) => Folder,
  setCurrentFolder: (folderId: string) => void,
  getCurrentCompany: () => Company | undefined
): OpenAIHook => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastId, setToastId] = useState<string | undefined>(undefined);

  const generateUseCases = async (input: string, createNewFolder: boolean = true): Promise<boolean> => {
    setIsGenerating(true);
    const newToastId = uuidv4();
    setToastId(newToastId);

    try {
      const apiKey = localStorage.getItem(apiKeySettings.apiKey) || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const model = localStorage.getItem(apiKeySettings.model) || "gpt-3.5-turbo";
      const useCasePrompt = localStorage.getItem(apiKeySettings.useCasePrompt) || process.env.NEXT_PUBLIC_OPENAI_USE_CASE_PROMPT;
      const folderPrompt = localStorage.getItem(apiKeySettings.folderPrompt) || process.env.NEXT_PUBLIC_OPENAI_FOLDER_PROMPT;

      if (!apiKey) {
        throw new Error("Clé API OpenAI non configurée. Veuillez configurer votre clé API dans les paramètres.");
      }

      const openAIService = new OpenAIService(apiKey);

      // 1. Generate folder name and description
      let folderName = "";
      let folderDescription = "";

      if (createNewFolder) {
        const company = getCurrentCompany();
        const folderInfo = await openAIService.generateFolderNameAndDescription(input, folderPrompt || "", model, company);
        folderName = folderInfo.name;
        folderDescription = folderInfo.description;

        // 2. Create folder
        const newFolder = addFolder(folderName, folderDescription);
        setCurrentFolder(newFolder.id);
      }

      // 3. Generate use case list
      const company = getCurrentCompany();
      const useCaseList = await openAIService.generateUseCaseList(input, useCasePrompt || "", model, company);

      if (!useCaseList || useCaseList.length === 0) {
        throw new Error("Aucun cas d'usage n'a été généré.");
      }

      // 4. Generate use case details for each use case
      const generatedUseCases: UseCase[] = [];
      for (const useCase of useCaseList) {
        try {
          const generatedUseCase = await openAIService.generateUseCaseDetail(useCase, input, matrixConfig, useCasePrompt || "", model, company);
          generatedUseCases.push(generatedUseCase);
          addUseCase(generatedUseCase);
        } catch (error: any) {
          console.error(`Failed to generate details for use case "${useCase}":`, error);
          toast.error(`Failed to generate details for use case "${useCase}".`);
        }
      }

      openAIService.finalizeGeneration(true, generatedUseCases.length);
      return true;

    } catch (error: any) {
      console.error("Error generating use cases:", error);
      openAIService.finalizeGeneration(false, 0);
      toast.error(error.message || "Une erreur est survenue lors de la génération des cas d'usage.");
      return false;

    } finally {
      setIsGenerating(false);
      setToastId(undefined);
    }
  };

  return { isGenerating, generateUseCases };
};
