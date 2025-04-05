
import { v4 as uuidv4 } from 'uuid';
import { Folder, MatrixConfig, UseCase } from '../types';
import { defaultMatrixConfig } from './defaultMatrixConfig';
import { FOLDERS_STORAGE_KEY, CURRENT_FOLDER_ID } from './constants';

// Generate an 8-character hash from a string
export const generateHashId = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString(16).padStart(8, '0');
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex string and ensure it's 8 characters
  return Math.abs(hash).toString(16).slice(0, 8).padStart(8, '0');
};

// Ensure ID uniqueness by checking against existing folders
export const generateUniqueId = (name: string, existingFolders: Folder[]): string => {
  let baseId = generateHashId(name);
  let uniqueId = baseId;
  let counter = 1;
  
  // Check if ID already exists, if so, append a counter
  while (existingFolders.some(folder => folder.id === uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }
  
  return uniqueId;
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

// Créer un nouveau dossier
export const createFolder = (name: string, description: string, config: MatrixConfig = defaultMatrixConfig): Folder => {
  const folders = getFolders();
  const newId = generateUniqueId(name, folders);
  
  const newFolder: Folder = {
    id: newId,
    name,
    description,
    createdAt: new Date(),
    matrixConfig: { ...config }
  };
  
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
