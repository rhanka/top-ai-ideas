
import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Clé de stockage local
const COMPANIES_STORAGE_KEY = 'topai-companies';
const CURRENT_COMPANY_ID_KEY = 'topai-current-company';

// Interface pour les options du hook
interface CompanyOperationsOptions {
  onCompanyChange?: (companyId: string | null) => void;
}

export const useCompanyOperations = (options?: CompanyOperationsOptions) => {
  // État pour les entreprises et l'entreprise active
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  // Chargement initial depuis le stockage local
  useEffect(() => {
    const loadedCompanies = localStorage.getItem(COMPANIES_STORAGE_KEY);
    const loadedCurrentCompanyId = localStorage.getItem(CURRENT_COMPANY_ID_KEY);
    
    if (loadedCompanies) {
      try {
        const parsedCompanies = JSON.parse(loadedCompanies);
        // Conversion des dates
        const companiesWithDates = parsedCompanies.map((company: any) => ({
          ...company,
          createdAt: new Date(company.createdAt),
          updatedAt: new Date(company.updatedAt),
        }));
        setCompanies(companiesWithDates);
      } catch (error) {
        console.error('Error parsing companies from localStorage:', error);
        setCompanies([]);
      }
    }

    if (loadedCurrentCompanyId) {
      setCurrentCompanyId(loadedCurrentCompanyId);
    }
  }, []);

  // Sauvegarde dans le stockage local à chaque changement
  useEffect(() => {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
  }, [companies]);

  // Sauvegarde de l'entreprise active
  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(CURRENT_COMPANY_ID_KEY, currentCompanyId);
    } else {
      localStorage.removeItem(CURRENT_COMPANY_ID_KEY);
    }
    
    // Appel du callback si fourni
    if (options?.onCompanyChange) {
      options.onCompanyChange(currentCompanyId);
    }
  }, [currentCompanyId, options]);

  // Ajouter une nouvelle entreprise
  const addCompany = useCallback((companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newCompany: Company = {
      ...companyData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    setCompanies(prev => [...prev, newCompany]);
    toast.success(`Entreprise "${companyData.name}" ajoutée`);
    return newCompany;
  }, []);

  // Mettre à jour une entreprise existante
  const updateCompany = useCallback((company: Company) => {
    setCompanies(prev => 
      prev.map(c => 
        c.id === company.id 
          ? { ...company, updatedAt: new Date() } 
          : c
      )
    );
    toast.success(`Entreprise "${company.name}" mise à jour`);
  }, []);

  // Supprimer une entreprise
  const deleteCompany = useCallback((id: string) => {
    const companyToDelete = companies.find(c => c.id === id);
    
    if (companyToDelete) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      
      // Si l'entreprise supprimée était l'entreprise active, réinitialiser
      if (currentCompanyId === id) {
        setCurrentCompanyId(null);
      }
      
      toast.success(`Entreprise "${companyToDelete.name}" supprimée`);
    }
  }, [companies, currentCompanyId]);

  // Définir l'entreprise active
  const setCurrentCompany = useCallback((companyId: string | null) => {
    console.log("Setting current company to:", companyId);
    setCurrentCompanyId(companyId);
    
    if (companyId) {
      const company = companies.find(c => c.id === companyId);
      if (company) {
        toast.info(`Entreprise active : ${company.name}`);
      }
    } else {
      toast.info("Aucune entreprise sélectionnée");
    }
  }, [companies]);

  // Obtenir l'entreprise active
  const getCurrentCompany = useCallback(() => {
    return currentCompanyId ? companies.find(c => c.id === currentCompanyId) : undefined;
  }, [companies, currentCompanyId]);

  return {
    companies,
    currentCompanyId,
    addCompany,
    updateCompany,
    deleteCompany,
    setCurrentCompany,
    getCurrentCompany,
  };
};
