
import React, { createContext, useState, useEffect } from "react";
import { UseCase, MatrixConfig, LevelThreshold, Folder } from "../types";
import { toast } from "sonner";
import initialUseCasesData from "../data/useCasesData.json";
import { defaultMatrixConfig } from "./defaultMatrixConfig";
import { calcInitialScore, getValueLevel, getComplexityLevel, countUseCasesInLevel } from "./useCaseUtils";
import { useOpenAI } from "./useOpenAI";
import { 
  getFolders, 
  saveFolders, 
  getCurrentFolderId, 
  setCurrentFolderId as setCurrentFolderIdInStorage,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderById
} from "./folderUtils";
import { AppContextType } from "./AppContextType";

// Create context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Assign the use cases initial to the first folder created
const getInitialUseCasesWithFolder = (folderId: string) => {
  return initialUseCasesData.map(useCase => ({
    ...useCase as UseCase,
    folderId
  }));
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for folders and current folder
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // State for use cases
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  const [currentInput, setCurrentInput] = useState<string>("");
  
  // Get the current matrix configuration
  const getCurrentMatrixConfig = (): MatrixConfig => {
    if (!currentFolderId) return defaultMatrixConfig;
    const currentFolder = folders.find(folder => folder.id === currentFolderId);
    return currentFolder ? currentFolder.matrixConfig : defaultMatrixConfig;
  };
  
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(getCurrentMatrixConfig());
  
  // Initialize folders and use cases at startup
  useEffect(() => {
    // Load existing folders
    const storedFolders = getFolders();
    
    // If no folders, create a default one
    if (storedFolders.length === 0) {
      const defaultFolder = createFolder("Centre d'appel", "Cas d'usage pour centre d'appel", defaultMatrixConfig);
      setFolders([defaultFolder]);
      
      // Add initial use cases to the default folder
      const initialUseCases = getInitialUseCasesWithFolder(defaultFolder.id);
      const scoredUseCases = initialUseCases.map(useCase => 
        calcInitialScore(useCase as UseCase, defaultFolder.matrixConfig)
      );
      setUseCases(scoredUseCases);
      
      // Set the default folder as active
      setCurrentFolderId(defaultFolder.id);
      setCurrentFolderIdInStorage(defaultFolder.id);
    } else {
      setFolders(storedFolders);
      
      // Load active folder from localStorage
      const storedFolderId = getCurrentFolderId();
      if (storedFolderId && storedFolders.some(f => f.id === storedFolderId)) {
        setCurrentFolderId(storedFolderId);
      } else {
        // If no active folder or invalid, use the first folder
        setCurrentFolderId(storedFolders[0].id);
        setCurrentFolderIdInStorage(storedFolders[0].id);
      }
      
      // Load use case data
      // For a real project, we would load use cases from an API
      // Here, we use initial data and assign it to the first folder
      const allUseCases = initialUseCasesData.map(useCase => ({
        ...useCase as UseCase,
        folderId: storedFolders[0].id
      }));
      
      const scoredUseCases = allUseCases.map(useCase => {
        const folder = storedFolders.find(f => f.id === useCase.folderId);
        return calcInitialScore(useCase, folder ? folder.matrixConfig : defaultMatrixConfig);
      });
      
      setUseCases(scoredUseCases);
    }
  }, []);
  
  // Update matrixConfig when active folder changes
  useEffect(() => {
    if (currentFolderId) {
      const currentFolder = folders.find(folder => folder.id === currentFolderId);
      if (currentFolder) {
        setMatrixConfig(currentFolder.matrixConfig);
      }
    }
  }, [currentFolderId, folders]);
  
  // Add use case handler for OpenAI service
  const handleAddUseCase = (useCase: UseCase) => {
    // Assign use case to active folder
    const useCaseWithFolder = {
      ...useCase,
      folderId: currentFolderId || ''
    };
    
    const currentConfig = getCurrentMatrixConfig();
    const newUseCase = calcInitialScore(useCaseWithFolder, currentConfig);
    setUseCases(prev => [...prev, newUseCase]);
  };
  
  // Initialize OpenAI hooks
  const { isGenerating, generateUseCases: generateUseCasesService } = useOpenAI(matrixConfig, handleAddUseCase);
  
  // Effect to update cases count in thresholds whenever useCases changes
  useEffect(() => {
    updateCasesCounts();
  }, [useCases, currentFolderId]);
  
  // Functions to manage folders
  const addFolder = (name: string, description: string): Folder => {
    const newFolder = createFolder(name, description, defaultMatrixConfig);
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };
  
  const handleUpdateFolder = (updatedFolder: Folder) => {
    const folder = updateFolder(updatedFolder);
    setFolders(prev => prev.map(f => f.id === folder.id ? folder : f));
    
    // Update matrixConfig if it's the active folder
    if (folder.id === currentFolderId) {
      setMatrixConfig(folder.matrixConfig);
    }
  };
  
  const handleDeleteFolder = (id: string) => {
    // Ensure at least one folder remains
    if (folders.length <= 1) {
      toast.error("Impossible de supprimer le dernier dossier");
      return;
    }
    
    // Delete associated use cases
    setUseCases(prev => prev.filter(useCase => useCase.folderId !== id));
    
    // Delete folder
    deleteFolder(id);
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    // If deleted folder was active, switch to first available folder
    if (currentFolderId === id) {
      const remainingFolders = folders.filter(folder => folder.id !== id);
      if (remainingFolders.length > 0) {
        setCurrentFolder(remainingFolders[0].id);
      }
    }
  };
  
  const setCurrentFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderIdInStorage(folderId);
    
    // Update matrix configuration
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setMatrixConfig(folder.matrixConfig);
    }
  };
  
  const getCurrentFolder = (): Folder | undefined => {
    return currentFolderId ? folders.find(folder => folder.id === currentFolderId) : undefined;
  };
  
  // Add new use case
  const addUseCase = (useCase: UseCase) => {
    // Assign to current folder
    const updatedUseCase = {
      ...useCase,
      folderId: currentFolderId || ''
    };
    
    const newUseCase = calcInitialScore(updatedUseCase, matrixConfig);
    setUseCases([...useCases, newUseCase]);
  };
  
  // Update existing use case
  const updateUseCase = (updatedUseCase: UseCase) => {
    const updated = calcInitialScore(updatedUseCase, matrixConfig);
    setUseCases(useCases.map(useCase => 
      useCase.id === updated.id ? updated : useCase
    ));
    
    if (activeUseCase?.id === updated.id) {
      setActiveUseCase(updated);
    }
  };
  
  // Delete use case
  const deleteUseCase = (id: string) => {
    setUseCases(useCases.filter(useCase => useCase.id !== id));
    if (activeUseCase?.id === id) {
      setActiveUseCase(null);
    }
  };
  
  // Update matrix configuration
  const updateMatrixConfig = (config: MatrixConfig) => {
    // Update matrix configuration for active folder
    if (currentFolderId) {
      const updatedFolders = folders.map(folder => {
        if (folder.id === currentFolderId) {
          return {
            ...folder,
            matrixConfig: config
          };
        }
        return folder;
      });
      
      setFolders(updatedFolders);
      saveFolders(updatedFolders);
    }
    
    setMatrixConfig(config);
    
    // Recalculate use case scores with new configuration
    // but only for current folder
    const currentFolderUseCases = useCases.filter(
      useCase => useCase.folderId === currentFolderId
    );
    
    const otherFolderUseCases = useCases.filter(
      useCase => useCase.folderId !== currentFolderId
    );
    
    const updatedUseCases = currentFolderUseCases.map(useCase => calcInitialScore(useCase, config));
    setUseCases([...otherFolderUseCases, ...updatedUseCases]);
    
    // Update active use case if any
    if (activeUseCase && activeUseCase.folderId === currentFolderId) {
      const updatedActive = updatedUseCases.find(u => u.id === activeUseCase.id);
      if (updatedActive) {
        setActiveUseCase(updatedActive);
      }
    }
  };
  
  // Update cases counts in thresholds
  const updateCasesCounts = () => {
    if (!matrixConfig.valueThresholds || !matrixConfig.complexityThresholds) return;
    
    // Filter use cases to count only those in current folder
    const currentFolderUseCases = currentFolderId 
      ? useCases.filter(useCase => useCase.folderId === currentFolderId)
      : [];
    
    // Create new arrays to avoid mutating state directly
    const updatedValueThresholds = [...matrixConfig.valueThresholds].map(threshold => ({
      ...threshold,
      cases: 0
    }));
    
    const updatedComplexityThresholds = [...matrixConfig.complexityThresholds].map(threshold => ({
      ...threshold,
      cases: 0
    }));
    
    // Count use cases for each level
    currentFolderUseCases.forEach(useCase => {
      const valueLevel = getValueLevel(useCase.totalValueScore, updatedValueThresholds);
      const complexityLevel = getComplexityLevel(useCase.totalComplexityScore, updatedComplexityThresholds);
      
      const valueThreshold = updatedValueThresholds.find(t => t.level === valueLevel);
      if (valueThreshold) {
        valueThreshold.cases = (valueThreshold.cases || 0) + 1;
      }
      
      const complexityThreshold = updatedComplexityThresholds.find(t => t.level === complexityLevel);
      if (complexityThreshold) {
        complexityThreshold.cases = (complexityThreshold.cases || 0) + 1;
      }
    });
    
    // Update matrix configuration with new counts but avoid a re-render if values are the same
    if (JSON.stringify(updatedValueThresholds) !== JSON.stringify(matrixConfig.valueThresholds) || 
        JSON.stringify(updatedComplexityThresholds) !== JSON.stringify(matrixConfig.complexityThresholds)) {
      setMatrixConfig(prevConfig => ({
        ...prevConfig,
        valueThresholds: updatedValueThresholds,
        complexityThresholds: updatedComplexityThresholds
      }));
    }
  };

  // Update thresholds
  const updateThresholds = (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => {
    const updatedMatrixConfig = { 
      ...matrixConfig,
      valueThresholds: valueThresholds || matrixConfig.valueThresholds,
      complexityThresholds: complexityThresholds || matrixConfig.complexityThresholds
    };
    
    // Update matrix configuration for active folder
    updateMatrixConfig(updatedMatrixConfig);
  };
  
  // Wrapper for the count function from useCaseUtils
  const countUseCasesInLevelWrapper = (isValue: boolean, level: number): number => {
    // Filter use cases to count only those in current folder
    const currentFolderUseCases = currentFolderId 
      ? useCases.filter(useCase => useCase.folderId === currentFolderId)
      : [];
    
    return countUseCasesInLevel(
      currentFolderUseCases, 
      matrixConfig.valueThresholds || [], 
      matrixConfig.complexityThresholds || [], 
      isValue, 
      level
    );
  };
  
  // Wrapper for generateUseCases to update currentInput
  const generateUseCases = async () => {
    if (!currentFolderId) {
      toast.error("Aucun dossier actif");
      return;
    }
    
    const success = await generateUseCasesService(currentInput);
    if (success) {
      setCurrentInput("");
    }
  };
  
  const value: AppContextType = {
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
    updateFolder: handleUpdateFolder,
    deleteFolder: handleDeleteFolder,
    setCurrentFolder,
    getCurrentFolder
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
