
import { UseCase, MatrixConfig, LevelThreshold, Folder, Company, IndustrySector, BusinessProcess } from "@/types";

// Context type with folders and companies
export type AppContextType = {
  useCases: UseCase[];
  matrixConfig: MatrixConfig;
  activeUseCase: UseCase | null;
  currentInput: string;
  folders: Folder[];
  currentFolderId: string | null;
  companies: Company[];
  currentCompanyId: string | null;
  sectors: IndustrySector[];
  processes: BusinessProcess[];
  
  // Fonctions pour gérer les cas d'usage
  addUseCase: (useCase: UseCase) => void;
  updateUseCase: (useCase: UseCase) => void;
  deleteUseCase: (id: string) => void;
  setActiveUseCase: (useCase: UseCase | null) => void;
  
  // Fonctions pour la configuration et la génération
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
  
  // Fonctions pour gérer les entreprises
  addCompany: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
  setCurrentCompany: (companyId: string | null) => void;
  getCurrentCompany: () => Company | undefined;
  
  // Fonctions pour gérer les secteurs d'activité
  addSector: (name: string) => IndustrySector;
  updateSector: (id: string, name: string) => void;
  deleteSector: (id: string) => void;
  
  // Fonctions pour gérer les processus métier
  addProcess: (name: string, description: string) => BusinessProcess;
  updateProcess: (id: string, name: string, description: string) => void;
  deleteProcess: (id: string) => void;
  resetBusinessConfig: () => void;
  getSectorById: (id: string) => IndustrySector | undefined;
  getProcessById: (id: string) => BusinessProcess | undefined;
  getProcessesByIds: (ids: string[]) => BusinessProcess[];
};
