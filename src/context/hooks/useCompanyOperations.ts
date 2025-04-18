
import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Storage keys
const COMPANIES_STORAGE_KEY = 'topai-companies';
const CURRENT_COMPANY_ID_KEY = 'topai-current-company';

interface CompanyOperationsOptions {
  onCompanyChange?: (companyId: string | null) => void;
}

export const useCompanyOperations = (options?: CompanyOperationsOptions) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  // Load from localStorage on init
  useEffect(() => {
    const loadedCompanies = localStorage.getItem(COMPANIES_STORAGE_KEY);
    const loadedCurrentCompanyId = localStorage.getItem(CURRENT_COMPANY_ID_KEY);
    
    if (loadedCompanies) {
      try {
        const parsedCompanies = JSON.parse(loadedCompanies);
        // Convert dates
        const companiesWithDates = parsedCompanies.map((company: any) => ({
          ...company,
          createdAt: new Date(company.createdAt),
          updatedAt: new Date(company.updatedAt),
        }));
        setCompanies(companiesWithDates);
        console.log('Companies loaded from localStorage:', companiesWithDates);
      } catch (error) {
        console.error('Error parsing companies from localStorage:', error);
        setCompanies([]);
      }
    } else {
      // Initialize with empty array in localStorage if it doesn't exist
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify([]));
      console.log('Initialized empty companies array in localStorage');
    }

    if (loadedCurrentCompanyId) {
      setCurrentCompanyId(loadedCurrentCompanyId);
    }
  }, []);

  // Save to localStorage when companies change
  useEffect(() => {
    // Only save to localStorage if companies state has been initialized
    // and is different from the current localStorage value
    if (companies) {
      const currentStoredCompanies = localStorage.getItem(COMPANIES_STORAGE_KEY);
      const currentCompaniesJson = JSON.stringify(companies);
      
      // Only update localStorage if the values are different
      if (currentStoredCompanies !== currentCompaniesJson) {
        localStorage.setItem(COMPANIES_STORAGE_KEY, currentCompaniesJson);
        console.log('Companies saved to localStorage:', companies);
      }
    }
  }, [companies]);

  // Save active company
  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(CURRENT_COMPANY_ID_KEY, currentCompanyId);
    } else {
      localStorage.removeItem(CURRENT_COMPANY_ID_KEY);
    }
    
    if (options?.onCompanyChange) {
      options.onCompanyChange(currentCompanyId);
    }
  }, [currentCompanyId, options]);

  // Add company
  const addCompany = useCallback((companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newCompany: Company = {
      ...companyData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    setCompanies(prev => [...prev, newCompany]);
    console.log('Adding company:', newCompany);
    toast.success(`Entreprise "${companyData.name}" ajoutée`);
    return newCompany;
  }, []);

  // Update company
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

  // Delete company
  const deleteCompany = useCallback((id: string) => {
    const companyToDelete = companies.find(c => c.id === id);
    
    if (companyToDelete) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      
      if (currentCompanyId === id) {
        setCurrentCompanyId(null);
      }
      
      toast.success(`Entreprise "${companyToDelete.name}" supprimée`);
    }
  }, [companies, currentCompanyId]);

  // Set active company
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

  // Get active company
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
