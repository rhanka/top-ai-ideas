import { useState, useEffect } from "react";
import { UseCase, MatrixConfig, LevelThreshold } from "@/types";
import {
  getUseCases,
  saveUseCases,
  addUseCase as addUseCaseUtil,
  updateUseCase as updateUseCaseUtil,
  deleteUseCase as deleteUseCaseUtil,
  getUseCasesForFolder
} from "../folderUtils";
import { calcInitialScore, getValueLevel, getComplexityLevel, countUseCasesInLevel } from "../useCaseUtils";
import initialUseCasesData from "@/data/useCases";

export interface UseUseCaseOperationsProps {
  currentFolderId: string | null;
  matrixConfig: MatrixConfig;
  onThresholdsUpdated: (valueThresholds: LevelThreshold[], complexityThresholds: LevelThreshold[]) => void;
}

export const useUseCaseOperations = ({ 
  currentFolderId, 
  matrixConfig, 
  onThresholdsUpdated 
}: UseUseCaseOperationsProps) => {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  
  useEffect(() => {
    const storedUseCases = getUseCases();
    
    if (storedUseCases.length === 0 && currentFolderId) {
      const initialUseCases = initialUseCasesData.map((initialData: any) => {
        return {
          ...initialData as Omit<UseCase, 'process'> & { domain?: string },
          process: initialData.process || initialData.domain || "Opérations",
          folderId: currentFolderId
        } as UseCase;
      });
      
      const scoredUseCases = initialUseCases.map(useCase => 
        calcInitialScore(useCase as UseCase, matrixConfig)
      );
      
      setUseCases(scoredUseCases);
      saveUseCases(scoredUseCases);
    } else {
      setUseCases(storedUseCases);
    }
  }, [currentFolderId, matrixConfig]);
  
  useEffect(() => {
    updateCasesCounts();
  }, [useCases, currentFolderId, matrixConfig]);
  
  const addUseCase = (useCase: UseCase) => {
    const updatedUseCase = {
      ...useCase,
      folderId: useCase.folderId || (currentFolderId || '')
    };
    
    console.log("Adding use case with folderId:", updatedUseCase.folderId);
    
    const newUseCase = calcInitialScore(updatedUseCase, matrixConfig);
    setUseCases(prev => [...prev, newUseCase]);
    addUseCaseUtil(newUseCase);
  };
  
  const updateUseCase = (updatedUseCase: UseCase) => {
    const updated = calcInitialScore(updatedUseCase, matrixConfig);
    
    setUseCases(useCases.map(useCase => 
      useCase.id === updated.id ? updated : useCase
    ));
    
    updateUseCaseUtil(updated);
    
    if (activeUseCase?.id === updated.id) {
      setActiveUseCase(updated);
    }
  };
  
  const deleteUseCase = (id: string) => {
    setUseCases(useCases.filter(useCase => useCase.id !== id));
    deleteUseCaseUtil(id);
    
    if (activeUseCase?.id === id) {
      setActiveUseCase(null);
    }
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
      onThresholdsUpdated(updatedValueThresholds, updatedComplexityThresholds);
    }
  };
  
  const recalculateScores = (config: MatrixConfig) => {
    const currentFolderUseCases = useCases.filter(
      useCase => useCase.folderId === currentFolderId
    );
    
    const otherFolderUseCases = useCases.filter(
      useCase => useCase.folderId !== currentFolderId
    );
    
    const updatedUseCases = currentFolderUseCases.map(useCase => calcInitialScore(useCase, config));
    const allUpdatedUseCases = [...otherFolderUseCases, ...updatedUseCases];
    
    setUseCases(allUpdatedUseCases);
    saveUseCases(allUpdatedUseCases);
    
    if (activeUseCase && activeUseCase.folderId === currentFolderId) {
      const updatedActive = updatedUseCases.find(u => u.id === activeUseCase.id);
      if (updatedActive) {
        setActiveUseCase(updatedActive);
      }
    }
  };

  return {
    useCases,
    activeUseCase,
    setActiveUseCase,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    countUseCasesInLevel: countUseCasesInLevelWrapper,
    recalculateScores
  };
};
