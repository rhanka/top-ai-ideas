
import React, { createContext, useContext, useState, useCallback } from "react";
import { UseCase, MatrixConfig, LevelThreshold, Folder } from "@/types";
import { toast } from "sonner";
import { useFolderOperations } from "./hooks/useFolderOperations";
import { useUseCaseOperations } from "./hooks/useUseCaseOperations";
import { useMatrixConfig } from "./hooks/useMatrixConfig";
import { useOpenAI } from "./useOpenAI";
import { AppContextType } from "./types/AppContextTypes";
import { getUseCasesForFolder } from "./folderUtils";

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentInput, setCurrentInput] = useState<string>("");
  
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
    onMatrixConfigChange: handleMatrixConfigChange
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
  
  // Add use case handler for OpenAI service
  const handleAddUseCase = useCallback((useCase: UseCase) => {
    // Respecter le folderId fourni par le cas d'usage généré
    // Si pas de folderId, utiliser le currentFolderId (cas par défaut)
    console.log("Adding use case with folder:", useCase.folderId || currentFolderId);
    
    const useCaseWithFolder = {
      ...useCase,
      folderId: useCase.folderId || currentFolderId || ''
    };
    
    addUseCase(useCaseWithFolder);
  }, [addUseCase, currentFolderId]);
  
  // Initialize OpenAI hooks
  const { isGenerating, generateUseCases: generateUseCasesService } = useOpenAI(
    matrixConfig, 
    handleAddUseCase, 
    addFolder, 
    setCurrentFolder
  );
  
  // Effect to update cases count in thresholds whenever useCases changes
  React.useEffect(() => {
    // This is handled in useUseCaseOperations
  }, [useCases, currentFolderId]);
  
  // Effect to update matrix config when current folder changes
  React.useEffect(() => {
    // This is handled in useMatrixConfig
  }, [currentFolderId, folders]);
  
  // Wrapper for generateUseCases to update currentInput
  const generateUseCases = async (input?: string, createNewFolder: boolean = true): Promise<boolean> => {
    console.log("Generating use cases with currentFolderId:", currentFolderId);
    console.log("Create new folder:", createNewFolder);
    
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
    getCurrentFolder
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
