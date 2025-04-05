
import { useState, useEffect } from "react";
import { Folder, MatrixConfig } from "@/types";
import { 
  getFolders, 
  saveFolders, 
  getCurrentFolderId, 
  setCurrentFolderId as setCurrentFolderIdUtil,
  createFolder,
  updateFolder as updateFolderUtil,
  deleteFolder as deleteFolderUtil,
  getFolderById
} from "../folderUtils";
import { toast } from "sonner";
import { defaultMatrixConfig } from "../defaultMatrixConfig";

export interface UseFolderOperationsProps {
  onFolderChange: (folderId: string | null) => void;
  onMatrixConfigChange: (config: MatrixConfig) => void;
}

export const useFolderOperations = ({ onFolderChange, onMatrixConfigChange }: UseFolderOperationsProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Initialize folders from localStorage
  useEffect(() => {
    const storedFolders = getFolders();
    
    // If no folders exist, create a default one
    if (storedFolders.length === 0) {
      const defaultFolder = createFolder("Centre d'appel", "Cas d'usage pour centre d'appel", defaultMatrixConfig);
      setFolders([defaultFolder]);
      setCurrentFolderId(defaultFolder.id);
      setCurrentFolderIdUtil(defaultFolder.id);
      onFolderChange(defaultFolder.id);
    } else {
      setFolders(storedFolders);
      
      // Load active folder from localStorage
      const storedFolderId = getCurrentFolderId();
      if (storedFolderId && storedFolders.some(f => f.id === storedFolderId)) {
        setCurrentFolderId(storedFolderId);
        onFolderChange(storedFolderId);
      } else {
        // Use first folder if no active folder or invalid ID
        setCurrentFolderId(storedFolders[0].id);
        setCurrentFolderIdUtil(storedFolders[0].id);
        onFolderChange(storedFolders[0].id);
      }
    }
  }, [onFolderChange]);
  
  // Add a new folder
  const addFolder = (name: string, description: string): Folder => {
    const newFolder = createFolder(name, description, defaultMatrixConfig);
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };
  
  // Update an existing folder
  const updateFolder = (updatedFolder: Folder) => {
    const updatedFolderResult = updateFolderUtil(updatedFolder);
    setFolders(prev => prev.map(f => f.id === updatedFolderResult.id ? updatedFolderResult : f));
    
    // Update matrix config if it's the active folder
    if (updatedFolderResult.id === currentFolderId) {
      onMatrixConfigChange(updatedFolderResult.matrixConfig);
    }
  };
  
  // Delete a folder
  const deleteFolder = (id: string) => {
    // Prevent deleting the last folder
    if (folders.length <= 1) {
      toast.error("Impossible de supprimer le dernier dossier");
      return;
    }
    
    // Delete folder and related use cases
    deleteFolderUtil(id);
    
    // Update local state
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    // If deleted folder was active, switch to first available folder
    if (currentFolderId === id) {
      const remainingFolders = folders.filter(folder => folder.id !== id);
      if (remainingFolders.length > 0) {
        setCurrentFolder(remainingFolders[0].id);
      }
    }
  };
  
  // Set current folder
  const setCurrentFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderIdUtil(folderId);
    onFolderChange(folderId);
    
    // Update matrix configuration
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      onMatrixConfigChange(folder.matrixConfig);
    }
  };
  
  // Get current folder
  const getCurrentFolder = (): Folder | undefined => {
    return currentFolderId ? folders.find(folder => folder.id === currentFolderId) : undefined;
  };
  
  return {
    folders,
    currentFolderId,
    addFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    getCurrentFolder
  };
};
