
import { useState, useEffect } from 'react';
import { IndustrySector, BusinessProcess } from '@/types';
import { 
  INDUSTRY_SECTORS_STORAGE_KEY, 
  BUSINESS_PROCESSES_STORAGE_KEY, 
  DEFAULT_INDUSTRY_SECTORS,
  DEFAULT_BUSINESS_PROCESSES
} from '@/context/constants';
import { toast } from 'sonner';

export const useBusinessConfig = () => {
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les secteurs et processus depuis le localStorage
  useEffect(() => {
    const loadSectors = () => {
      try {
        const storedSectors = localStorage.getItem(INDUSTRY_SECTORS_STORAGE_KEY);
        if (storedSectors) {
          setSectors(JSON.parse(storedSectors));
        } else {
          // Initialiser avec les valeurs par défaut
          setSectors(DEFAULT_INDUSTRY_SECTORS);
          localStorage.setItem(INDUSTRY_SECTORS_STORAGE_KEY, JSON.stringify(DEFAULT_INDUSTRY_SECTORS));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des secteurs:', error);
        setSectors(DEFAULT_INDUSTRY_SECTORS);
      }
    };

    const loadProcesses = () => {
      try {
        const storedProcesses = localStorage.getItem(BUSINESS_PROCESSES_STORAGE_KEY);
        if (storedProcesses) {
          setProcesses(JSON.parse(storedProcesses));
        } else {
          // Initialiser avec les valeurs par défaut
          setProcesses(DEFAULT_BUSINESS_PROCESSES);
          localStorage.setItem(BUSINESS_PROCESSES_STORAGE_KEY, JSON.stringify(DEFAULT_BUSINESS_PROCESSES));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des processus:', error);
        setProcesses(DEFAULT_BUSINESS_PROCESSES);
      }
    };

    loadSectors();
    loadProcesses();
    setIsLoading(false);
  }, []);

  // Sauvegarder les secteurs dans localStorage
  const saveSectors = (updatedSectors: IndustrySector[]) => {
    try {
      localStorage.setItem(INDUSTRY_SECTORS_STORAGE_KEY, JSON.stringify(updatedSectors));
      setSectors(updatedSectors);
      toast.success('Secteurs d\'activité mis à jour');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des secteurs:', error);
      toast.error('Erreur lors de la sauvegarde des secteurs');
    }
  };

  // Sauvegarder les processus dans localStorage
  const saveProcesses = (updatedProcesses: BusinessProcess[]) => {
    try {
      localStorage.setItem(BUSINESS_PROCESSES_STORAGE_KEY, JSON.stringify(updatedProcesses));
      setProcesses(updatedProcesses);
      toast.success('Processus métier mis à jour');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des processus:', error);
      toast.error('Erreur lors de la sauvegarde des processus');
    }
  };

  // Ajouter un nouveau secteur
  const addSector = (name: string) => {
    const newSector: IndustrySector = {
      id: `sector_${Date.now()}`,
      name
    };
    const updatedSectors = [...sectors, newSector];
    saveSectors(updatedSectors);
    return newSector;
  };

  // Mettre à jour un secteur existant
  const updateSector = (id: string, name: string) => {
    const updatedSectors = sectors.map(sector => 
      sector.id === id ? { ...sector, name } : sector
    );
    saveSectors(updatedSectors);
  };

  // Supprimer un secteur
  const deleteSector = (id: string) => {
    const updatedSectors = sectors.filter(sector => sector.id !== id);
    saveSectors(updatedSectors);
  };

  // Ajouter un nouveau processus
  const addProcess = (name: string, description: string) => {
    const newProcess: BusinessProcess = {
      id: `process_${Date.now()}`,
      name,
      description
    };
    const updatedProcesses = [...processes, newProcess];
    saveProcesses(updatedProcesses);
    return newProcess;
  };

  // Mettre à jour un processus existant
  const updateProcess = (id: string, name: string, description: string) => {
    const updatedProcesses = processes.map(process => 
      process.id === id ? { ...process, name, description } : process
    );
    saveProcesses(updatedProcesses);
  };

  // Supprimer un processus
  const deleteProcess = (id: string) => {
    const updatedProcesses = processes.filter(process => process.id !== id);
    saveProcesses(updatedProcesses);
  };

  // Réinitialiser aux valeurs par défaut
  const resetToDefaults = () => {
    saveSectors(DEFAULT_INDUSTRY_SECTORS);
    saveProcesses(DEFAULT_BUSINESS_PROCESSES);
    toast.success('Réinitialisation effectuée');
  };

  // Obtenir un secteur par ID
  const getSectorById = (id: string): IndustrySector | undefined => {
    return sectors.find(sector => sector.id === id);
  };

  // Obtenir un processus par ID
  const getProcessById = (id: string): BusinessProcess | undefined => {
    return processes.find(process => process.id === id);
  };

  // Obtenir plusieurs processus par leurs IDs
  const getProcessesByIds = (ids: string[]): BusinessProcess[] => {
    return processes.filter(process => ids.includes(process.id));
  };

  return {
    sectors,
    processes,
    isLoading,
    addSector,
    updateSector,
    deleteSector,
    addProcess,
    updateProcess,
    deleteProcess,
    resetToDefaults,
    getSectorById,
    getProcessById,
    getProcessesByIds
  };
};
