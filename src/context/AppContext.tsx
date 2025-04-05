
import React, { createContext, useContext, useState, useEffect } from "react";
import { UseCase, MatrixConfig, LevelThreshold } from "../types";
import { toast } from "sonner";
import initialUseCasesData from "../data/useCasesData.json";
import { defaultMatrixConfig } from "./defaultMatrixConfig";
import { calcInitialScore, getValueLevel, getComplexityLevel, countUseCasesInLevel } from "./useCaseUtils";
import { useOpenAI } from "./useOpenAI";

// Initialize use cases with calculated scores
const initialUseCases = initialUseCasesData.map(useCase => 
  calcInitialScore(useCase as UseCase, defaultMatrixConfig)
);

// Context type
type AppContextType = {
  useCases: UseCase[];
  matrixConfig: MatrixConfig;
  activeUseCase: UseCase | null;
  currentInput: string;
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
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Move useState hooks to the top level of the function component
  const [useCases, setUseCases] = useState<UseCase[]>(initialUseCases);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(defaultMatrixConfig);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  const [currentInput, setCurrentInput] = useState<string>("");
  
  // Add use case handler for OpenAI service
  const handleAddUseCase = (useCase: UseCase) => {
    const newUseCase = calcInitialScore(useCase, matrixConfig);
    setUseCases(prev => [...prev, newUseCase]);
  };
  
  // Initialize OpenAI hooks
  const { isGenerating, generateUseCases: generateUseCasesService } = useOpenAI(matrixConfig, handleAddUseCase);
  
  // Effect to update cases count in thresholds whenever useCases changes
  useEffect(() => {
    updateCasesCounts();
    // Only depend on useCases, not on threshold states which get updated in updateCasesCounts
  }, [useCases]);
  
  // Add new use case
  const addUseCase = (useCase: UseCase) => {
    const newUseCase = calcInitialScore(useCase, matrixConfig);
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
    setMatrixConfig(config);
    
    // Recalculate all use case scores with new configuration
    const updatedUseCases = useCases.map(useCase => calcInitialScore(useCase, config));
    setUseCases(updatedUseCases);
    
    // Update active use case if any
    if (activeUseCase) {
      const updatedActive = updatedUseCases.find(u => u.id === activeUseCase.id);
      if (updatedActive) {
        setActiveUseCase(updatedActive);
      }
    }
  };
  
  // Update cases counts in thresholds
  const updateCasesCounts = () => {
    if (!matrixConfig.valueThresholds || !matrixConfig.complexityThresholds) return;
    
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
    useCases.forEach(useCase => {
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
    setMatrixConfig(prevConfig => ({ 
      ...prevConfig,
      valueThresholds: valueThresholds || prevConfig.valueThresholds,
      complexityThresholds: complexityThresholds || prevConfig.complexityThresholds
    }));
  };
  
  // Wrapper for the count function from useCaseUtils
  const countUseCasesInLevelWrapper = (isValue: boolean, level: number): number => {
    return countUseCasesInLevel(
      useCases, 
      matrixConfig.valueThresholds || [], 
      matrixConfig.complexityThresholds || [], 
      isValue, 
      level
    );
  };
  
  // Wrapper for generateUseCases to update currentInput
  const generateUseCases = async () => {
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
    addUseCase,
    updateUseCase,
    deleteUseCase,
    setActiveUseCase,
    updateMatrixConfig,
    setCurrentInput,
    generateUseCases,
    updateThresholds,
    countUseCasesInLevel: countUseCasesInLevelWrapper,
    isGenerating
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
