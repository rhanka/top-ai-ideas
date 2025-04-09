
import { useState } from 'react';
import { UseCase, MatrixConfig, Folder } from '../types';
import { toast } from 'sonner';
import { OpenAIService } from '../services/OpenAIService';
import { 
  OPENAI_API_KEY, 
  USE_CASE_LIST_PROMPT, 
  USE_CASE_DETAIL_PROMPT, 
  FOLDER_NAME_PROMPT,
  DEFAULT_USE_CASE_LIST_PROMPT, 
  DEFAULT_USE_CASE_DETAIL_PROMPT,
  DEFAULT_FOLDER_NAME_PROMPT,
  USE_CASE_LIST_MODEL,
  USE_CASE_DETAIL_MODEL,
  FOLDER_NAME_MODEL,
  DEFAULT_LIST_MODEL,
  DEFAULT_DETAIL_MODEL,
  DEFAULT_FOLDER_MODEL
} from './constants';
import { calcInitialScore } from './useCaseUtils';
import { v4 as uuidv4 } from 'uuid';

export const useOpenAI = (
  matrixConfig: MatrixConfig, 
  addUseCase: (useCase: UseCase) => void, 
  addFolder: (name: string, description: string) => Folder,
  setCurrentFolder: (folderId: string) => void
) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate folder name and description using OpenAI
  const generateFolderNameAndDescription = async (
    currentInput: string, 
    openai: OpenAIService
  ): Promise<Folder | null> => {
    try {
      // Get folder generation prompt from localStorage or use default
      const folderPrompt = localStorage.getItem(FOLDER_NAME_PROMPT) || DEFAULT_FOLDER_NAME_PROMPT;
      // Get the model from localStorage or use default
      const model = localStorage.getItem(FOLDER_NAME_MODEL) || DEFAULT_FOLDER_MODEL;
      
      // Generate folder name and description
      const { name, description } = await openai.generateFolderNameAndDescription(currentInput, folderPrompt, model);
      
      // Create the new folder
      const newFolder = addFolder(name, description);
      
      // Set new folder as active
      setCurrentFolder(newFolder.id);
      
      return newFolder;
    } catch (error) {
      console.error("Error generating folder name:", error);
      return null;
    }
  };

  // Generate new use cases based on user input using OpenAI
  const generateUseCases = async (currentInput: string, createNewFolder: boolean): Promise<boolean> => {
    if (currentInput.trim().length === 0) {
      toast.error("Veuillez saisir une description de votre activité");
      return false;
    }

    // Get OpenAI API key from localStorage
    const apiKey = localStorage.getItem(OPENAI_API_KEY);
    if (!apiKey) {
      toast.error("Clé API OpenAI non configurée", {
        description: "Veuillez configurer votre clé API dans les paramètres",
        action: {
          label: "Paramètres",
          onClick: () => window.location.href = "/parametres",
        },
      });
      return false;
    }

    // Get prompts from localStorage or use defaults
    const listPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT) || DEFAULT_USE_CASE_LIST_PROMPT;
    const detailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT) || DEFAULT_USE_CASE_DETAIL_PROMPT;
    
    // Get models from localStorage or use defaults
    const listModel = localStorage.getItem(USE_CASE_LIST_MODEL) || DEFAULT_LIST_MODEL;
    const detailModel = localStorage.getItem(USE_CASE_DETAIL_MODEL) || DEFAULT_DETAIL_MODEL;

    const openai = new OpenAIService(apiKey);
    setIsGenerating(true);
    
    try {
      // Si createNewFolder est true, générer un nouveau dossier d'abord
      let newFolderId: string | null = null;
      
      if (createNewFolder) {
        const newFolder = await generateFolderNameAndDescription(currentInput, openai);
        if (newFolder) {
          newFolderId = newFolder.id;
          // Assurons-nous que le dossier est bien défini comme courant
          setCurrentFolder(newFolder.id);
        }
      }
      
      // Step 1: Generate list of use case titles
      toast.info("Génération des cas d'usage en cours...");
      const useCaseTitles = await openai.generateUseCaseList(currentInput, listPrompt, listModel);
      
      if (useCaseTitles.length === 0) {
        toast.error("Aucun cas d'usage généré. Veuillez reformuler votre demande.");
        setIsGenerating(false);
        return false;
      }

      // Step 2: For each use case title, generate detailed use case
      let successCount = 0;
      
      for (const title of useCaseTitles) {
        try {
          const useCaseDetail = await openai.generateUseCaseDetail(
            title,
            currentInput,
            matrixConfig,
            detailPrompt,
            detailModel
          );
          
          // Ajouter un id unique en plus de celui généré par OpenAI
          const useCaseWithId = {
            ...useCaseDetail,
            id: uuidv4(),
            // Important: Utiliser le nouveau dossier ID si disponible
            // Si pas de nouveau dossier créé, ce champ sera vide et sera géré par handleAddUseCase
            folderId: newFolderId || ''
          };
          
          // Calculate scores for the use case
          const scoredUseCase = calcInitialScore(useCaseWithId, matrixConfig);
          addUseCase(scoredUseCase);
          successCount++;
          
        } catch (error) {
          console.error(`Error generating details for "${title}":`, error);
        }
      }

      // Finalize the generation process
      if (successCount > 0) {
        openai.finalizeGeneration(true, successCount);
        return true;
      } else {
        openai.finalizeGeneration(false, 0);
        return false;
      }
    } catch (error) {
      console.error("Error in use case generation:", error);
      toast.error("Erreur lors de la génération des cas d'usage", {
        description: (error as Error).message,
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateUseCases };
};
