
import { useState, useEffect } from "react";
import { MatrixConfig, LevelThreshold, Folder } from "@/types";
import { defaultMatrixConfig } from "../defaultMatrixConfig";
import { saveFolders } from "../folderUtils";

export interface UseMatrixConfigProps {
  folders: Folder[];
  currentFolderId: string | null;
  onFoldersUpdated: (updatedFolders: Folder[]) => void;
}

export const useMatrixConfig = ({ folders, currentFolderId, onFoldersUpdated }: UseMatrixConfigProps) => {
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(defaultMatrixConfig);
  
  // Update matrix config when current folder changes
  useEffect(() => {
    if (currentFolderId) {
      const currentFolder = folders.find(folder => folder.id === currentFolderId);
      if (currentFolder) {
        setMatrixConfig(currentFolder.matrixConfig);
      }
    }
  }, [currentFolderId, folders]);
  
  // Get current matrix configuration
  const getCurrentMatrixConfig = (): MatrixConfig => {
    if (!currentFolderId) return defaultMatrixConfig;
    const currentFolder = folders.find(folder => folder.id === currentFolderId);
    return currentFolder ? currentFolder.matrixConfig : defaultMatrixConfig;
  };
  
  // Update matrix configuration
  const updateMatrixConfig = (config: MatrixConfig) => {
    // Update matrix config for current folder
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
      
      onFoldersUpdated(updatedFolders);
      saveFolders(updatedFolders);
    }
    
    setMatrixConfig(config);
  };
  
  // Update thresholds only
  const updateThresholds = (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => {
    const updatedMatrixConfig = { 
      ...matrixConfig,
      valueThresholds: valueThresholds || matrixConfig.valueThresholds,
      complexityThresholds: complexityThresholds || matrixConfig.complexityThresholds
    };
    
    updateMatrixConfig(updatedMatrixConfig);
  };
  
  return {
    matrixConfig,
    updateMatrixConfig,
    updateThresholds,
    getCurrentMatrixConfig
  };
};
