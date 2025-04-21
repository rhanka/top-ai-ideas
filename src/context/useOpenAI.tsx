
import { useState } from 'react';
import { UseCase, MatrixConfig, Folder, Company, BusinessProcess } from '../types';
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const useOpenAI = (
  matrixConfig: MatrixConfig, 
  addUseCase: (useCase: UseCase) => void, 
  addFolder: (name: string, description: string) => Folder,
  setCurrentFolder: (folderId: string) => void,
  getCurrentCompany: () => Company | undefined,
  getProcessesByIds?: (ids: string[]) => BusinessProcess[]
) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateFolderNameAndDescription = async (
    currentInput: string, 
    openai: OpenAIService
  ): Promise<Folder | null> => {
    try {
      const folderPrompt = localStorage.getItem(FOLDER_NAME_PROMPT) || DEFAULT_FOLDER_NAME_PROMPT;
      const model = localStorage.getItem(FOLDER_NAME_MODEL) || DEFAULT_FOLDER_MODEL;
      
      const currentCompany = getCurrentCompany();
      
      const { name, description } = await openai.generateFolderNameAndDescription(
        currentInput, 
        folderPrompt, 
        model,
        currentCompany
      );
      
      const newFolder = addFolder(name, description);
      
      setCurrentFolder(newFolder.id);
      
      return newFolder;
    } catch (error) {
      console.error("Error generating folder name:", error);
      return null;
    }
  };

  const generateUseCases = async (currentInput: string, createNewFolder: boolean): Promise<boolean> => {
    if (currentInput.trim().length === 0) {
      toast.error("Veuillez saisir une description de votre activité");
      return false;
    }

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

    const maxRetries = Number(localStorage.getItem("use_case_max_retries")) || 2;
    const parallelQueue = Number(localStorage.getItem("use_case_parallel_queue")) || 5;

    const listPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT) || DEFAULT_USE_CASE_LIST_PROMPT;
    const detailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT) || DEFAULT_USE_CASE_DETAIL_PROMPT;
    
    const listModel = localStorage.getItem(USE_CASE_LIST_MODEL) || DEFAULT_LIST_MODEL;
    const detailModel = localStorage.getItem(USE_CASE_DETAIL_MODEL) || DEFAULT_DETAIL_MODEL;

    const currentCompany = getCurrentCompany();
    
    // Récupérer les processus liés à l'entreprise si elle est définie
    let associatedProcesses: BusinessProcess[] = [];
    if (currentCompany && currentCompany.businessProcesses && getProcessesByIds) {
      associatedProcesses = getProcessesByIds(currentCompany.businessProcesses);
    }
    
    const openai = new OpenAIService(apiKey);
    setIsGenerating(true);
    
    try {
      let newFolderId: string | null = null;
      
      if (createNewFolder) {
        const newFolder = await generateFolderNameAndDescription(currentInput, openai);
        if (newFolder) {
          newFolderId = newFolder.id;
          setCurrentFolder(newFolder.id);
        }
      }
      
      toast.info("Génération des cas d'usage en cours...");
      const useCaseTitles = await openai.generateUseCaseList(
        currentInput, 
        listPrompt, 
        listModel, 
        currentCompany
      );
      
      if (useCaseTitles.length === 0) {
        toast.error("Aucun cas d'usage généré. Veuillez reformuler votre demande.");
        setIsGenerating(false);
        return false;
      }

      let processed = 0, successCount = 0, failureCount = 0;
      const total = useCaseTitles.length;
      const errors: { title: string; error: any }[] = [];
      let inProgress = 0;
      let currentIndex = 0;

      const results: { ok: boolean; title: string; error?: any }[] = [];

      function updateToast() {
        toast.info(
          `Génération ${processed}/${total} – OK: ${successCount} / ERREURS: ${failureCount}`,
          { description: "Génération des cas d'usage détaillés en cours...", duration: 500 }
        );
      }

      const tryGenerateDetail = async (title: string, retry = 0): Promise<{ ok: boolean; useCase?: UseCase; error?: any }> => {
        try {
          const useCaseDetail = await openai.generateUseCaseDetail(
            title,
            currentInput,
            matrixConfig,
            detailPrompt,
            detailModel,
            currentCompany,
            associatedProcesses
          );
          return { ok: true, useCase: useCaseDetail };
        } catch (error) {
          if (retry < maxRetries) {
            await sleep(500 + 200 * retry);
            return tryGenerateDetail(title, retry + 1);
          }
          return { ok: false, error };
        }
      };

      async function processQueue() {
        return new Promise<void>((resolve) => {
          function next() {
            if (currentIndex >= total && inProgress === 0) {
              resolve();
              return;
            }
            while (inProgress < parallelQueue && currentIndex < total) {
              const title = useCaseTitles[currentIndex];
              inProgress++;
              currentIndex++;
              (async () => {
                const detailResult = await tryGenerateDetail(title);
                processed++;
                if (detailResult.ok && detailResult.useCase) {
                  const useCaseWithId = {
                    ...detailResult.useCase,
                    id: uuidv4(),
                    folderId: newFolderId || '',
                    companyId: currentCompany?.id,
                    // Assurer que les processus existants sont conservés
                    businessProcesses: detailResult.useCase.businessProcesses || 
                                      (currentCompany?.businessProcesses || [])
                  };
                  const scoredUseCase = calcInitialScore(useCaseWithId, matrixConfig);
                  addUseCase(scoredUseCase);
                  results.push({ ok: true, title });
                  successCount++;
                } else {
                  results.push({ ok: false, title, error: detailResult.error });
                  errors.push({ title, error: detailResult.error });
                  failureCount++;
                }
                inProgress--;
                updateToast();
                next();
              })();
            }
          }
          next();
        });
      }

      updateToast();
      await processQueue();

      if (successCount > 0) {
        let description = `${successCount} cas d'usage générés avec succès.`;
        if (failureCount > 0) {
          description += `\n${failureCount} cas en échec.`;
          const errTitles = errors.map(e => `- ${e.title}`).join("\n");
          if (errTitles) description += `\nÉchecs: \n${errTitles}`;
        }
        openai.finalizeGeneration(failureCount === 0, successCount);
        toast.success("Génération terminée", { description, duration: 6000 });
        return true;
      } else {
        openai.finalizeGeneration(false, 0);
        toast.error("Tous les cas ont échoué à générer.", { description: "Veuillez réessayer ou vérifier votre configuration.", duration: 6000 });
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
