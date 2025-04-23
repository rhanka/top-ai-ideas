
import React, { createContext, useContext, useState, useCallback } from "react";
import { UseCase, MatrixConfig, LevelThreshold, Folder, Company } from "@/types";
import { toast } from "sonner";
import { useFolderOperations } from "./hooks/useFolderOperations";
import { useUseCaseOperations } from "./hooks/useUseCaseOperations";
import { useMatrixConfig } from "./hooks/useMatrixConfig";
import { useOpenAI } from "./useOpenAI";
import { AppContextType } from "./types/AppContextTypes";
import { getUseCasesForFolder } from "./folderUtils";
import { useCompanyOperations } from "./hooks/useCompanyOperations";

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentInput, setCurrentInput] = useState<string>("");
  
  // Initialize company operations
  const {
    companies,
    currentCompanyId,
    addCompany,
    updateCompany,
    deleteCompany,
    setCurrentCompany,
    getCurrentCompany
  } = useCompanyOperations();
  
  // Callback for folder changes
  const handleFolderChange = useCallback((folderId: string | null) => {
    console.log("Folder changed to:", folderId);
    // Nothing to do here - the state is managed by useFolderOperations
  }, []);
  
  // Callback for matrix config changes
  const handleMatrixConfigChange = useCallback((config: MatrixConfig) => {
    // Nothing to do here - the state is managed by useMatrixConfig
  }, []);
  
  // Initialize folder operations
  const {
    folders,
    currentFolderId,
    addFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    getCurrentFolder
  } = useFolderOperations({
    onFolderChange: handleFolderChange,
    onMatrixConfigChange: handleMatrixConfigChange,
    currentCompanyId // Passer l'ID de l'entreprise actuelle pour créer de nouveaux dossiers
  });
  
  // Callback for folders update
  const handleFoldersUpdated = useCallback((updatedFolders: Folder[]) => {
    // This function is passed to useMatrixConfig to update folders
    // No need to do anything here as folders are managed by useFolderOperations
  }, []);
  
  // Initialize matrix config
  const {
    matrixConfig,
    updateMatrixConfig,
    updateThresholds
  } = useMatrixConfig({
    folders,
    currentFolderId,
    onFoldersUpdated: handleFoldersUpdated
  });
  
  // Callback for thresholds update
  const handleThresholdsUpdated = useCallback((
    valueThresholds: LevelThreshold[], 
    complexityThresholds: LevelThreshold[]
  ) => {
    updateThresholds(valueThresholds, complexityThresholds);
  }, [updateThresholds]);
  
  // Initialize use case operations
  const {
    useCases,
    activeUseCase,
    setActiveUseCase,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    countUseCasesInLevel: countUseCasesInLevelWrapper,
    recalculateScores
  } = useUseCaseOperations({
    currentFolderId,
    matrixConfig,
    onThresholdsUpdated: handleThresholdsUpdated
  });
  
  // Obtenir l'entreprise associée au dossier actuel
  const getCurrentFolderCompany = useCallback(() => {
    const currentFolder = getCurrentFolder();
    if (currentFolder?.companyId) {
      return companies.find(company => company.id === currentFolder.companyId);
    }
    return undefined;
  }, [getCurrentFolder, companies]);
  
  // Add use case handler for OpenAI service
  const handleAddUseCase = useCallback((useCase: UseCase) => {
    // Respecter le folderId fourni par le cas d'usage généré
    // Si pas de folderId, utiliser le currentFolderId (cas par défaut)
    console.log("Adding use case with folder:", useCase.folderId || currentFolderId);
    
    // Récupérer l'entreprise associée au dossier actuel
    const currentFolder = getCurrentFolder();
    
    const useCaseWithFolder = {
      ...useCase,
      folderId: useCase.folderId || currentFolderId || '',
      companyId: currentFolder?.companyId // Utiliser l'ID de l'entreprise du dossier courant
    };
    
    addUseCase(useCaseWithFolder);
  }, [addUseCase, currentFolderId, getCurrentFolder]);
  
  // Initialize OpenAI hooks
  const { isGenerating, generateUseCases: generateUseCasesService } = useOpenAI(
    matrixConfig, 
    handleAddUseCase, 
    addFolder, 
    setCurrentFolder,
    getCurrentFolderCompany // Passer la fonction pour obtenir l'entreprise associée au dossier
  );
  
  // Wrapper for generateUseCases to update currentInput
  const generateUseCases = async (input?: string, createNewFolder: boolean = true): Promise<boolean> => {
    console.log("Generating use cases with currentFolderId:", currentFolderId);
    console.log("Create new folder:", createNewFolder);
    console.log("Current folder company:", getCurrentFolderCompany()?.name);
    
    if (!currentFolderId && !createNewFolder) {
      toast.error("Aucun dossier actif");
      return false;
    }
    
    const inputToUse = input || currentInput;
    
    const success = await generateUseCasesService(inputToUse, createNewFolder);
    if (success) {
      setCurrentInput("");
    }
    return success;
  };
  
  const value = {
    useCases,
    matrixConfig,
    activeUseCase,
    currentInput,
    folders,
    currentFolderId,
    companies,
    currentCompanyId,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    setActiveUseCase,
    updateMatrixConfig,
    setCurrentInput,
    generateUseCases,
    updateThresholds,
    countUseCasesInLevel: countUseCasesInLevelWrapper,
    isGenerating,
    addFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    getCurrentFolder,
    getCurrentFolderCompany,
    addCompany,
    updateCompany,
    deleteCompany,
    setCurrentCompany,
    getCurrentCompany
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Export the context directly
export { AppContext };
