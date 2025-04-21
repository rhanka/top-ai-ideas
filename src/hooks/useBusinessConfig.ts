
import { useState, useEffect } from 'react';
import { BusinessSector, BusinessProcess, DEFAULT_SECTORS, DEFAULT_PROCESSES } from '@/types/business';

const SECTORS_STORAGE_KEY = "business_sectors";
const PROCESSES_STORAGE_KEY = "business_processes";

export const useBusinessConfig = () => {
  const [sectors, setSectors] = useState<BusinessSector[]>([]);
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);

  useEffect(() => {
    const storedSectors = localStorage.getItem(SECTORS_STORAGE_KEY);
    const storedProcesses = localStorage.getItem(PROCESSES_STORAGE_KEY);
    
    setSectors(storedSectors ? JSON.parse(storedSectors) : DEFAULT_SECTORS);
    setProcesses(storedProcesses ? JSON.parse(storedProcesses) : DEFAULT_PROCESSES);
  }, []);

  const saveSectors = (updatedSectors: BusinessSector[]) => {
    localStorage.setItem(SECTORS_STORAGE_KEY, JSON.stringify(updatedSectors));
    setSectors(updatedSectors);
  };

  const saveProcesses = (updatedProcesses: BusinessProcess[]) => {
    localStorage.setItem(PROCESSES_STORAGE_KEY, JSON.stringify(updatedProcesses));
    setProcesses(updatedProcesses);
  };

  const resetToDefaults = () => {
    saveSectors(DEFAULT_SECTORS);
    saveProcesses(DEFAULT_PROCESSES);
  };

  return {
    sectors,
    processes,
    saveSectors,
    saveProcesses,
    resetToDefaults
  };
};
