
import { v4 as uuidv4 } from 'uuid';
import { Folder, MatrixConfig, UseCase } from '../types';
import { defaultMatrixConfig } from './defaultMatrixConfig';
import { FOLDERS_STORAGE_KEY, CURRENT_FOLDER_ID } from './constants';

// Generate a simple hash from a string (folder name)
export const generateHashId = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
};

// Generate a unique ID based on name, with fallback to UUID
export const generateUniqueId = (name: string): string => {
  const baseId = generateHashId(name);
  const folders = getFolders();
  
  // Check if ID already exists
  if (folders.some(folder => folder.id === baseId)) {
    return uuidv4(); // Fallback to UUID if hash collides
  }
  
  return baseId;
};

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

// Clés de stockage pour les cas d'usage et les matrices
const getUseCasesStorageKey = (folderId: string): string => `usecases_${folderId}`;

// Sauvegarder les cas d'usage d'un dossier
export const saveUseCases = (folderId: string, useCases: UseCase[]): void => {
  const folderUseCases = useCases.filter(useCase => useCase.folderId === folderId);
  localStorage.setItem(getUseCasesStorageKey(folderId), JSON.stringify(folderUseCases));
};

// Récupérer les cas d'usage d'un dossier
export const getUseCasesFromStorage = (folderId: string): UseCase[] => {
  const useCasesJson = localStorage.getItem(getUseCasesStorageKey(folderId));
  if (!useCasesJson) return [];
  
  try {
    return JSON.parse(useCasesJson);
  } catch (error) {
    console.error(`Erreur lors de la récupération des cas d'usage pour le dossier ${folderId}:`, error);
    return [];
  }
};

// Récupérer tous les cas d'usage de tous les dossiers
export const getAllUseCases = (): UseCase[] => {
  const folders = getFolders();
  let allUseCases: UseCase[] = [];
  
  folders.forEach(folder => {
    const folderUseCases = getUseCasesFromStorage(folder.id);
    allUseCases = [...allUseCases, ...folderUseCases];
  });
  
  return allUseCases;
};

// Créer un nouveau dossier
export const createFolder = (name: string, description: string, config: MatrixConfig = defaultMatrixConfig): Folder => {
  const newFolder: Folder = {
    id: generateUniqueId(name),
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
  
  // Supprimer également les cas d'usage de ce dossier
  localStorage.removeItem(getUseCasesStorageKey(folderId));
  
  // Si le dossier supprimé était le dossier actif, réinitialiser
  if (getCurrentFolderId() === folderId) {
    localStorage.removeItem(CURRENT_FOLDER_ID);
  }
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
