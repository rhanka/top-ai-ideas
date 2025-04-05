
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
import initialUseCasesData from "@/data/useCasesData.json";

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
  
  // Load use cases from localStorage or initialize with default data
  useEffect(() => {
    const storedUseCases = getUseCases();
    
    if (storedUseCases.length === 0 && currentFolderId) {
      // If no stored use cases, use initial data and assign to first folder
      const initialUseCases = initialUseCasesData.map(useCase => ({
        ...useCase as UseCase,
        folderId: currentFolderId
      }));
      
      const scoredUseCases = initialUseCases.map(useCase => 
        calcInitialScore(useCase as UseCase, matrixConfig)
      );
      
      setUseCases(scoredUseCases);
      saveUseCases(scoredUseCases);
    } else {
      setUseCases(storedUseCases);
    }
  }, [currentFolderId, matrixConfig]);
  
  // Update case counts when use cases or folder changes
  useEffect(() => {
    updateCasesCounts();
  }, [useCases, currentFolderId, matrixConfig]);
  
  // Add a new use case
  const addUseCase = (useCase: UseCase) => {
    // Assign to current folder
    const updatedUseCase = {
      ...useCase,
      folderId: currentFolderId || ''
    };
    
    const newUseCase = calcInitialScore(updatedUseCase, matrixConfig);
    setUseCases(prev => [...prev, newUseCase]);
    addUseCaseUtil(newUseCase);
  };
  
  // Update an existing use case
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
  
  // Delete a use case
  const deleteUseCase = (id: string) => {
    setUseCases(useCases.filter(useCase => useCase.id !== id));
    deleteUseCaseUtil(id);
    
    if (activeUseCase?.id === id) {
      setActiveUseCase(null);
    }
  };
  
  // Count use cases in a specific level
  const countUseCasesInLevelWrapper = (isValue: boolean, level: number): number => {
    // Filter use cases to only count those in the current folder
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
  
  // Update cases counts in thresholds
  const updateCasesCounts = () => {
    if (!matrixConfig.valueThresholds || !matrixConfig.complexityThresholds) return;
    
    // Filter use cases for current folder
    const currentFolderUseCases = currentFolderId 
      ? useCases.filter(useCase => useCase.folderId === currentFolderId)
      : [];
    
    // Create new arrays to avoid mutating state
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
    
    // Update thresholds if changed
    if (JSON.stringify(updatedValueThresholds) !== JSON.stringify(matrixConfig.valueThresholds) || 
        JSON.stringify(updatedComplexityThresholds) !== JSON.stringify(matrixConfig.complexityThresholds)) {
      onThresholdsUpdated(updatedValueThresholds, updatedComplexityThresholds);
    }
  };
  
  // Function to recalculate use case scores with new matrix config
  const recalculateScores = (config: MatrixConfig) => {
    // Only recalculate scores for current folder
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
    
    // Update active use case if any
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
