
import { UseCase, MatrixConfig, LevelThreshold, Folder } from "@/types";

// Context type with folders
export type AppContextType = {
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
  // Fonctions pour gérer les dossiers
  addFolder: (name: string, description: string) => Folder;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (folderId: string) => void;
  getCurrentFolder: () => Folder | undefined;
};
