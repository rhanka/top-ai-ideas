
import { v4 as uuidv4 } from 'uuid';
import { Folder, MatrixConfig, UseCase } from '../types';
import { defaultMatrixConfig } from './defaultMatrixConfig';
import { FOLDERS_STORAGE_KEY, CURRENT_FOLDER_ID } from './constants';

// Récupérer tous les dossiers depuis le localStorage
export const getFolders = (): Folder[] => {
  const foldersJson = localStorage.getItem(FOLDERS_STORAGE_KEY);
  if (!foldersJson) return [];
  
  try {
    const folders = JSON.parse(foldersJson);
    return folders.map((folder: any) => ({
      ...folder,
      createdAt: new Date(folder.createdAt)
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers:", error);
    return [];
  }
};

// Sauvegarder tous les dossiers dans le localStorage
export const saveFolders = (folders: Folder[]): void => {
  localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
};

// Récupérer le dossier actif
export const getCurrentFolderId = (): string | null => {
  return localStorage.getItem(CURRENT_FOLDER_ID);
};

// Définir le dossier actif
export const setCurrentFolderId = (folderId: string): void => {
  localStorage.setItem(CURRENT_FOLDER_ID, folderId);
};

// Créer un nouveau dossier
export const createFolder = (name: string, description: string, config: MatrixConfig = defaultMatrixConfig): Folder => {
  const newFolder: Folder = {
    id: uuidv4(),
    name,
    description,
    createdAt: new Date(),
    matrixConfig: { ...config }
  };
  
  const folders = getFolders();
  saveFolders([...folders, newFolder]);
  
  return newFolder;
};

// Mettre à jour un dossier existant
export const updateFolder = (updatedFolder: Folder): Folder => {
  const folders = getFolders();
  const updatedFolders = folders.map(folder => 
    folder.id === updatedFolder.id ? updatedFolder : folder
  );
  
  saveFolders(updatedFolders);
  return updatedFolder;
};

// Supprimer un dossier
export const deleteFolder = (folderId: string): void => {
  let folders = getFolders();
  folders = folders.filter(folder => folder.id !== folderId);
  saveFolders(folders);
  
  // Si le dossier supprimé était le dossier actif, réinitialiser
  if (getCurrentFolderId() === folderId) {
    localStorage.removeItem(CURRENT_FOLDER_ID);
  }
  
  // Supprimer également les cas d'usage associés au dossier
  const useCases = getUseCases();
  const filteredUseCases = useCases.filter(useCase => useCase.folderId !== folderId);
  saveUseCases(filteredUseCases);
};

// Récupérer un dossier par son ID
export const getFolderById = (folderId: string): Folder | undefined => {
  const folders = getFolders();
  return folders.find(folder => folder.id === folderId);
};

// Filtrer les cas d'usage par dossier
export const filterUseCasesByFolder = (useCases: UseCase[], folderId: string): UseCase[] => {
  return useCases.filter(useCase => useCase.folderId === folderId);
};

// Clé pour stocker les cas d'usage dans le localStorage
const USE_CASES_STORAGE_KEY = 'use_cases';

// Récupérer tous les cas d'usage depuis le localStorage
export const getUseCases = (): UseCase[] => {
  const useCasesJson = localStorage.getItem(USE_CASES_STORAGE_KEY);
  if (!useCasesJson) return [];
  
  try {
    return JSON.parse(useCasesJson);
  } catch (error) {
    console.error("Erreur lors de la récupération des cas d'usage:", error);
    return [];
  }
};

// Sauvegarder tous les cas d'usage dans le localStorage
export const saveUseCases = (useCases: UseCase[]): void => {
  localStorage.setItem(USE_CASES_STORAGE_KEY, JSON.stringify(useCases));
};

// Ajouter un cas d'usage
export const addUseCase = (useCase: UseCase): UseCase => {
  const useCases = getUseCases();
  const updatedUseCases = [...useCases, useCase];
  saveUseCases(updatedUseCases);
  return useCase;
};

// Mettre à jour un cas d'usage existant
export const updateUseCase = (updatedUseCase: UseCase): UseCase => {
  const useCases = getUseCases();
  const updatedUseCases = useCases.map(useCase => 
    useCase.id === updatedUseCase.id ? updatedUseCase : useCase
  );
  
  saveUseCases(updatedUseCases);
  return updatedUseCase;
};

// Supprimer un cas d'usage
export const deleteUseCase = (useCaseId: string): void => {
  const useCases = getUseCases();
  const updatedUseCases = useCases.filter(useCase => useCase.id !== useCaseId);
  saveUseCases(updatedUseCases);
};

// Récupérer les cas d'usage d'un dossier spécifique
export const getUseCasesForFolder = (folderId: string): UseCase[] => {
  const useCases = getUseCases();
  return useCases.filter(useCase => useCase.folderId === folderId);
};
