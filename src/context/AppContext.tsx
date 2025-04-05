
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
  setCurrentFolderId,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderById
} from "./folderUtils";

// Assigner les cas d'usage initiaux au premier dossier créé
const getInitialUseCasesWithFolder = (folderId: string) => {
  return initialUseCasesData.map(useCase => ({
    ...useCase as UseCase,
    folderId
  }));
};

// Context type with folders
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
  generateUseCases: () => Promise<void>;
  updateThresholds: (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => void;
  countUseCasesInLevel: (isValue: boolean, level: number) => number;
  isGenerating: boolean;
  // Nouvelles fonctions pour gérer les dossiers
  addFolder: (name: string, description: string) => Folder;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (folderId: string) => void;
  getCurrentFolder: () => Folder | undefined;
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État pour les dossiers et le dossier actif
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // État pour les cas d'usage
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  const [currentInput, setCurrentInput] = useState<string>("");
  
  // Obtenir la configuration de matrice actuelle
  const getCurrentMatrixConfig = (): MatrixConfig => {
    if (!currentFolderId) return defaultMatrixConfig;
    const currentFolder = folders.find(folder => folder.id === currentFolderId);
    return currentFolder ? currentFolder.matrixConfig : defaultMatrixConfig;
  };
  
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(getCurrentMatrixConfig());
  
  // Initialiser les dossiers et cas d'usage au démarrage
  useEffect(() => {
    // Charger les dossiers existants
    const storedFolders = getFolders();
    
    // S'il n'y a pas de dossiers, en créer un par défaut
    if (storedFolders.length === 0) {
      const defaultFolder = createFolder("Centre d'appel", "Cas d'usage pour centre d'appel", defaultMatrixConfig);
      setFolders([defaultFolder]);
      
      // Ajouter les cas d'usage initiaux au dossier par défaut
      const initialUseCases = getInitialUseCasesWithFolder(defaultFolder.id);
      const scoredUseCases = initialUseCases.map(useCase => 
        calcInitialScore(useCase as UseCase, defaultFolder.matrixConfig)
      );
      setUseCases(scoredUseCases);
      
      // Définir le dossier par défaut comme dossier actif
      setCurrentFolderId(defaultFolder.id);
      setCurrentFolderId(defaultFolder.id);
    } else {
      setFolders(storedFolders);
      
      // Charger le dossier actif depuis le localStorage
      const storedFolderId = getCurrentFolderId();
      if (storedFolderId && storedFolders.some(f => f.id === storedFolderId)) {
        setCurrentFolderId(storedFolderId);
      } else {
        // Si pas de dossier actif ou invalide, utiliser le premier dossier
        setCurrentFolderId(storedFolders[0].id);
        setCurrentFolderId(storedFolders[0].id);
      }
      
      // Charger les données des cas d'usage
      // Pour un projet réel, nous chargerions les cas d'usage depuis une API
      // Ici, nous utilisons les données initiales et les attribuons au premier dossier
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
  
  // Mettre à jour la matrixConfig lorsque le dossier actif change
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
    // Assigner le cas d'usage au dossier actif
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
  
  // Fonctions pour gérer les dossiers
  const addFolder = (name: string, description: string): Folder => {
    const newFolder = createFolder(name, description, defaultMatrixConfig);
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };
  
  const handleUpdateFolder = (updatedFolder: Folder) => {
    const folder = updateFolder(updatedFolder);
    setFolders(prev => prev.map(f => f.id === folder.id ? folder : f));
    
    // Mise à jour de la matrixConfig si c'est le dossier actif
    if (folder.id === currentFolderId) {
      setMatrixConfig(folder.matrixConfig);
    }
  };
  
  const handleDeleteFolder = (id: string) => {
    // Vérifier qu'il reste au moins un dossier
    if (folders.length <= 1) {
      toast.error("Impossible de supprimer le dernier dossier");
      return;
    }
    
    // Supprimer les cas d'usage associés
    setUseCases(prev => prev.filter(useCase => useCase.folderId !== id));
    
    // Supprimer le dossier
    deleteFolder(id);
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    // Si c'était le dossier actif, passer au premier dossier disponible
    if (currentFolderId === id) {
      const remainingFolders = folders.filter(folder => folder.id !== id);
      if (remainingFolders.length > 0) {
        setCurrentFolder(remainingFolders[0].id);
      }
    }
  };
  
  const setCurrentFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderId(folderId);
    
    // Mettre à jour la configuration de la matrice
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
    // Mise à jour de la configuration de la matrice pour le dossier actif
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
    
    // Recalculate all use case scores with new configuration
    // but only for the current folder
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
    
    // Filtrer les cas d'usage pour ne compter que ceux du dossier actif
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
    
    // Mettre à jour la configuration de la matrice du dossier actif
    updateMatrixConfig(updatedMatrixConfig);
  };
  
  // Wrapper for the count function from useCaseUtils
  const countUseCasesInLevelWrapper = (isValue: boolean, level: number): number => {
    // Filtrer les cas d'usage pour ne compter que ceux du dossier actif
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
