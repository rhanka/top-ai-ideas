import React, { createContext, useContext, useState, useEffect } from "react";
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
  setCurrentFolderId as setCurrentFolderIdUtil,
  createFolder,
  updateFolder as updateFolderUtil,
  deleteFolder as deleteFolderUtil,
  getFolderById,
  saveUseCases,
  getUseCasesFromStorage,
  getAllUseCases
} from "./folderUtils";

const getInitialUseCasesWithFolder = (folderId: string) => {
  return initialUseCasesData.map(useCase => ({
    ...useCase as UseCase,
    folderId
  }));
};

type AppContextType = {
  useCases: UseCase[];
  matrixConfig: MatrixConfig;
  activeUseCase: UseCase | null;
  currentInput: string;
  folders: Folder[];
  currentFolderId: string | null;
  addUseCase: (useCase: UseCase) => void;
  updateUseCase: (useCase: UseCase) => void;
  deleteUseCase: (id: string) => void;
  setActiveUseCase: (useCase: UseCase | null) => void;
  updateMatrixConfig: (config: MatrixConfig) => void;
  setCurrentInput: (input: string) => void;
  generateUseCases: (input?: string, createNewFolder?: boolean) => Promise<boolean>;
  updateThresholds: (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => void;
  countUseCasesInLevel: (isValue: boolean, level: number) => number;
  isGenerating: boolean;
  addFolder: (name: string, description: string) => Folder;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (folderId: string) => void;
  getCurrentFolder: () => Folder | undefined;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  const [currentInput, setCurrentInput] = useState<string>("");
  
  const getCurrentMatrixConfig = (): MatrixConfig => {
    if (!currentFolderId) return defaultMatrixConfig;
    const currentFolder = folders.find(folder => folder.id === currentFolderId);
    return currentFolder ? currentFolder.matrixConfig : defaultMatrixConfig;
  };
  
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(getCurrentMatrixConfig());
  
  useEffect(() => {
    const storedFolders = getFolders();
    
    if (storedFolders.length === 0) {
      const defaultFolder = createFolder("Centre d'appel", "Cas d'usage pour centre d'appel", defaultMatrixConfig);
      setFolders([defaultFolder]);
      
      const initialUseCases = getInitialUseCasesWithFolder(defaultFolder.id);
      const scoredUseCases = initialUseCases.map(useCase => 
        calcInitialScore(useCase as UseCase, defaultFolder.matrixConfig)
      );
      setUseCases(scoredUseCases);
      
      saveUseCases(defaultFolder.id, scoredUseCases);
      
      setCurrentFolderId(defaultFolder.id);
      setCurrentFolderIdUtil(defaultFolder.id);
    } else {
      setFolders(storedFolders);
      
      const storedFolderId = getCurrentFolderId();
      if (storedFolderId && storedFolders.some(f => f.id === storedFolderId)) {
        setCurrentFolderId(storedFolderId);
      } else {
        setCurrentFolderId(storedFolders[0].id);
        setCurrentFolderIdUtil(storedFolders[0].id);
      }
      
      const storedUseCases = getAllUseCases();
      
      if (storedUseCases.length === 0) {
        const allUseCases = initialUseCasesData.map(useCase => ({
          ...useCase as UseCase,
          folderId: storedFolders[0].id
        }));
        
        const scoredUseCases = allUseCases.map(useCase => {
          const folder = storedFolders.find(f => f.id === useCase.folderId);
          return calcInitialScore(useCase, folder ? folder.matrixConfig : defaultMatrixConfig);
        });
        
        setUseCases(scoredUseCases);
        
        saveUseCases(storedFolders[0].id, scoredUseCases);
      } else {
        setUseCases(storedUseCases);
      }
    }
  }, []);
  
  useEffect(() => {
    if (currentFolderId) {
      const currentFolder = folders.find(folder => folder.id === currentFolderId);
      if (currentFolder) {
        setMatrixConfig(currentFolder.matrixConfig);
      }
    }
  }, [currentFolderId, folders]);
  
  const handleAddUseCase = (useCase: UseCase) => {
    const useCaseWithFolder = {
      ...useCase,
      folderId: currentFolderId || ''
    };
    
    const currentConfig = getCurrentMatrixConfig();
    const newUseCase = calcInitialScore(useCaseWithFolder, currentConfig);
    const updatedUseCases = [...useCases, newUseCase];
    
    setUseCases(updatedUseCases);
    
    if (currentFolderId) {
      saveUseCases(currentFolderId, updatedUseCases);
    }
  };

  const addFolder = (name: string, description: string): Folder => {
    const newFolder = createFolder(name, description, defaultMatrixConfig);
    setFolders(prev => [...prev, newFolder]);
    saveFolders([...folders, newFolder]);
    return newFolder;
  };
  
  const handleUpdateFolder = (updatedFolder: Folder) => {
    const updatedFolderResult = updateFolderUtil(updatedFolder);
    setFolders(prev => prev.map(f => f.id === updatedFolderResult.id ? updatedFolderResult : f));
    
    if (updatedFolderResult.id === currentFolderId) {
      setMatrixConfig(updatedFolderResult.matrixConfig);
      
      const folderUseCases = useCases.filter(useCase => useCase.folderId === currentFolderId);
      const updatedFolderUseCases = folderUseCases.map(useCase => 
        calcInitialScore(useCase, updatedFolderResult.matrixConfig)
      );
      
      const otherUseCases = useCases.filter(useCase => useCase.folderId !== currentFolderId);
      const allUpdatedUseCases = [...otherUseCases, ...updatedFolderUseCases];
      setUseCases(allUpdatedUseCases);
      
      saveUseCases(currentFolderId, allUpdatedUseCases);
    }
  };
  
  const handleDeleteFolder = (id: string) => {
    if (folders.length <= 1) {
      toast.error("Impossible de supprimer le dernier dossier");
      return;
    }
    
    setUseCases(prev => prev.filter(useCase => useCase.folderId !== id));
    
    deleteFolderUtil(id);
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    if (currentFolderId === id) {
      const remainingFolders = folders.filter(folder => folder.id !== id);
      if (remainingFolders.length > 0) {
        setCurrentFolder(remainingFolders[0].id);
      }
    }
  };
  
  const setCurrentFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderIdUtil(folderId);
    
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setMatrixConfig(folder.matrixConfig);
    }
  };
  
  const getCurrentFolder = (): Folder | undefined => {
    return currentFolderId ? folders.find(folder => folder.id === currentFolderId) : undefined;
  };
  
  const { isGenerating, generateUseCases: generateUseCasesService } = useOpenAI(
    matrixConfig, 
    handleAddUseCase, 
    addFolder, 
    setCurrentFolder
  );
  
  useEffect(() => {
    updateCasesCounts();
  }, [useCases, currentFolderId]);
  
  const addUseCase = (useCase: UseCase) => {
    const updatedUseCase = {
      ...useCase,
      folderId: currentFolderId || ''
    };
    
    const newUseCase = calcInitialScore(updatedUseCase, matrixConfig);
    const updatedUseCases = [...useCases, newUseCase];
    
    setUseCases(updatedUseCases);
    
    if (currentFolderId) {
      saveUseCases(currentFolderId, updatedUseCases);
    }
  };
  
  const updateUseCase = (updatedUseCase: UseCase) => {
    const updated = calcInitialScore(updatedUseCase, matrixConfig);
    const updatedUseCases = useCases.map(useCase => 
      useCase.id === updated.id ? updated : useCase
    );
    
    setUseCases(updatedUseCases);
    
    if (activeUseCase?.id === updated.id) {
      setActiveUseCase(updated);
    }
    
    if (updatedUseCase.folderId) {
      saveUseCases(updatedUseCase.folderId, updatedUseCases);
    }
  };
  
  const deleteUseCase = (id: string) => {
    const useCaseToDelete = useCases.find(useCase => useCase.id === id);
    if (!useCaseToDelete) return;
    
    const folderId = useCaseToDelete.folderId;
    const updatedUseCases = useCases.filter(useCase => useCase.id !== id);
    
    setUseCases(updatedUseCases);
    
    if (activeUseCase?.id === id) {
      setActiveUseCase(null);
    }
    
    if (folderId) {
      saveUseCases(folderId, updatedUseCases);
    }
  };
  
  const updateMatrixConfig = (config: MatrixConfig) => {
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
    
    const currentFolderUseCases = useCases.filter(
      useCase => useCase.folderId === currentFolderId
    );
    
    const otherFolderUseCases = useCases.filter(
      useCase => useCase.folderId !== currentFolderId
    );
    
    const updatedUseCases = currentFolderUseCases.map(useCase => calcInitialScore(useCase, config));
    const allUpdatedUseCases = [...otherFolderUseCases, ...updatedUseCases];
    
    setUseCases(allUpdatedUseCases);
    
    if (currentFolderId) {
      saveUseCases(currentFolderId, allUpdatedUseCases);
    }
    
    if (activeUseCase && activeUseCase.folderId === currentFolderId) {
      const updatedActive = updatedUseCases.find(u => u.id === activeUseCase.id);
      if (updatedActive) {
        setActiveUseCase(updatedActive);
      }
    }
  };
  
  const updateCasesCounts = () => {
    if (!matrixConfig.valueThresholds || !matrixConfig.complexityThresholds) return;
    
    const currentFolderUseCases = currentFolderId 
      ? useCases.filter(useCase => useCase.folderId === currentFolderId)
      : [];
    
    const updatedValueThresholds = [...matrixConfig.valueThresholds].map(threshold => ({
      ...threshold,
      cases: 0
    }));
    
    const updatedComplexityThresholds = [...matrixConfig.complexityThresholds].map(threshold => ({
      ...threshold,
      cases: 0
    }));
    
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
    
    if (JSON.stringify(updatedValueThresholds) !== JSON.stringify(matrixConfig.valueThresholds) || 
        JSON.stringify(updatedComplexityThresholds) !== JSON.stringify(matrixConfig.complexityThresholds)) {
      setMatrixConfig(prevConfig => ({
        ...prevConfig,
        valueThresholds: updatedValueThresholds,
        complexityThresholds: updatedComplexityThresholds
      }));
    }
  };

  const updateThresholds = (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => {
    const updatedMatrixConfig = { 
      ...matrixConfig,
      valueThresholds: valueThresholds || matrixConfig.valueThresholds,
      complexityThresholds: complexityThresholds || matrixConfig.complexityThresholds
    };
    
    updateMatrixConfig(updatedMatrixConfig);
  };
  
  const countUseCasesInLevelWrapper = (isValue: boolean, level: number): number => {
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
  
  const generateUseCases = async (input?: string, createNewFolder: boolean = true): Promise<boolean> => {
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

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppContext };
