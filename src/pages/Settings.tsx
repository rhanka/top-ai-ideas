import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import APIKeyCard from "@/components/Settings/APIKeyCard";
import PromptCard from "@/components/Settings/PromptCard";
import ActionButtons from "@/components/Settings/ActionButtons";
import ConcurrencyCard from "@/components/Settings/ConcurrencyCard";
import { 
  OPENAI_API_KEY, 
  USE_CASE_LIST_PROMPT, 
  USE_CASE_DETAIL_PROMPT, 
  FOLDER_NAME_PROMPT,
  COMPANY_INFO_PROMPT,
  USE_CASE_LIST_MODEL,
  USE_CASE_DETAIL_MODEL,
  FOLDER_NAME_MODEL,
  COMPANY_INFO_MODEL,
  DEFAULT_LIST_MODEL,
  DEFAULT_DETAIL_MODEL,
  DEFAULT_FOLDER_MODEL,
  DEFAULT_COMPANY_INFO_MODEL,
  DEFAULT_USE_CASE_LIST_PROMPT,
  DEFAULT_USE_CASE_DETAIL_PROMPT,
  DEFAULT_FOLDER_NAME_PROMPT,
  DEFAULT_COMPANY_INFO_PROMPT,
  PARALLEL_REQUESTS_LIMIT,
  DEFAULT_PARALLEL_REQUESTS,
  RETRY_ATTEMPTS_LIMIT,
  DEFAULT_RETRY_ATTEMPTS
} from "@/context/constants";

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [useCaseListPrompt, setUseCaseListPrompt] = useState<string>(DEFAULT_USE_CASE_LIST_PROMPT);
  const [useCaseDetailPrompt, setUseCaseDetailPrompt] = useState<string>(DEFAULT_USE_CASE_DETAIL_PROMPT);
  const [folderNamePrompt, setFolderNamePrompt] = useState<string>(DEFAULT_FOLDER_NAME_PROMPT);
  const [companyInfoPrompt, setCompanyInfoPrompt] = useState<string>(DEFAULT_COMPANY_INFO_PROMPT);
  
  // Model selection states
  const [useCaseListModel, setUseCaseListModel] = useState<string>(DEFAULT_LIST_MODEL);
  const [useCaseDetailModel, setUseCaseDetailModel] = useState<string>(DEFAULT_DETAIL_MODEL);
  const [folderNameModel, setFolderNameModel] = useState<string>(DEFAULT_FOLDER_MODEL);
  const [companyInfoModel, setCompanyInfoModel] = useState<string>(DEFAULT_COMPANY_INFO_MODEL);
  
  // Concurrency and retry settings
  const [concurrencyLimit, setConcurrencyLimit] = useState<number>(DEFAULT_PARALLEL_REQUESTS);
  const [retryAttempts, setRetryAttempts] = useState<number>(DEFAULT_RETRY_ATTEMPTS);
  
  const [saved, setSaved] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved values from localStorage on component mount
    const savedKey = localStorage.getItem(OPENAI_API_KEY);
    const savedListPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT);
    const savedDetailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT);
    const savedFolderNamePrompt = localStorage.getItem(FOLDER_NAME_PROMPT);
    const savedCompanyInfoPrompt = localStorage.getItem(COMPANY_INFO_PROMPT);
    
    // Load saved model selections
    const savedListModel = localStorage.getItem(USE_CASE_LIST_MODEL);
    const savedDetailModel = localStorage.getItem(USE_CASE_DETAIL_MODEL);
    const savedFolderModel = localStorage.getItem(FOLDER_NAME_MODEL);
    const savedCompanyInfoModel = localStorage.getItem(COMPANY_INFO_MODEL);
    
    // Load concurrency and retry settings
    const savedConcurrencyLimit = localStorage.getItem(PARALLEL_REQUESTS_LIMIT);
    const savedRetryAttempts = localStorage.getItem(RETRY_ATTEMPTS_LIMIT);
    
    if (savedKey) {
      setApiKey(savedKey);
      setSaved(true);
    }
    
    if (savedListPrompt) {
      setUseCaseListPrompt(savedListPrompt);
    }
    
    if (savedDetailPrompt) {
      setUseCaseDetailPrompt(savedDetailPrompt);
    }
    
    if (savedFolderNamePrompt) {
      setFolderNamePrompt(savedFolderNamePrompt);
    }
    
    if (savedCompanyInfoPrompt) {
      setCompanyInfoPrompt(savedCompanyInfoPrompt);
    }
    
    // Set model selections from localStorage or use defaults
    if (savedListModel) {
      setUseCaseListModel(savedListModel);
    }
    
    if (savedDetailModel) {
      setUseCaseDetailModel(savedDetailModel);
    }
    
    if (savedFolderModel) {
      setFolderNameModel(savedFolderModel);
    }
    
    if (savedCompanyInfoModel) {
      setCompanyInfoModel(savedCompanyInfoModel);
    }
    
    // Set concurrency limit from localStorage or use default
    if (savedConcurrencyLimit) {
      setConcurrencyLimit(parseInt(savedConcurrencyLimit));
    }
    
    // Set retry attempts from localStorage or use default
    if (savedRetryAttempts) {
      setRetryAttempts(parseInt(savedRetryAttempts));
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erreur",
        description: "La clé API ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    // Simple format validation (this is basic - OpenAI keys usually start with "sk-")
    if (!apiKey.startsWith("sk-")) {
      toast({
        title: "Attention",
        description: "Le format de clé API semble incorrect",
        variant: "default",
      });
    }

    // Save values to localStorage
    localStorage.setItem(OPENAI_API_KEY, apiKey);
    localStorage.setItem(USE_CASE_LIST_PROMPT, useCaseListPrompt);
    localStorage.setItem(USE_CASE_DETAIL_PROMPT, useCaseDetailPrompt);
    localStorage.setItem(FOLDER_NAME_PROMPT, folderNamePrompt);
    localStorage.setItem(COMPANY_INFO_PROMPT, companyInfoPrompt);
    
    // Save model selections
    localStorage.setItem(USE_CASE_LIST_MODEL, useCaseListModel);
    localStorage.setItem(USE_CASE_DETAIL_MODEL, useCaseDetailModel);
    localStorage.setItem(FOLDER_NAME_MODEL, folderNameModel);
    localStorage.setItem(COMPANY_INFO_MODEL, companyInfoModel);
    
    // Save concurrency and retry settings
    localStorage.setItem(PARALLEL_REQUESTS_LIMIT, concurrencyLimit.toString());
    localStorage.setItem(RETRY_ATTEMPTS_LIMIT, retryAttempts.toString());
    
    setSaved(true);
    
    toast({
      title: "Succès",
      description: "Les paramètres ont été enregistrés",
      variant: "default",
    });
  };

  const resetPrompts = () => {
    setUseCaseListPrompt(DEFAULT_USE_CASE_LIST_PROMPT);
    setUseCaseDetailPrompt(DEFAULT_USE_CASE_DETAIL_PROMPT);
    setFolderNamePrompt(DEFAULT_FOLDER_NAME_PROMPT);
    setCompanyInfoPrompt(DEFAULT_COMPANY_INFO_PROMPT);
    
    // Reset models to defaults
    setUseCaseListModel(DEFAULT_LIST_MODEL);
    setUseCaseDetailModel(DEFAULT_DETAIL_MODEL);
    setFolderNameModel(DEFAULT_FOLDER_MODEL);
    setCompanyInfoModel(DEFAULT_COMPANY_INFO_MODEL);
    
    // Reset concurrency and retry settings to defaults
    setConcurrencyLimit(DEFAULT_PARALLEL_REQUESTS);
    setRetryAttempts(DEFAULT_RETRY_ATTEMPTS);
    
    toast({
      title: "Prompts réinitialisés",
      description: "Les prompts, modèles et paramètres ont été réinitialisés aux valeurs par défaut",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <APIKeyCard
        apiKey={apiKey}
        setApiKey={setApiKey}
        saved={saved}
        setSaved={setSaved}
        handleSave={handleSave}
      />
      
      <ConcurrencyCard
        concurrencyValue={concurrencyLimit}
        setConcurrencyValue={setConcurrencyLimit}
        retryAttemptsValue={retryAttempts}
        setRetryAttemptsValue={setRetryAttempts}
      />
      
      <PromptCard
        title="Prompt pour la liste de cas d'usage"
        description="Ce prompt sera utilisé pour générer une liste de cas d'usage à partir de l'entrée utilisateur. Utilisez {{user_input}} comme placeholder pour l'entrée de l'utilisateur."
        promptValue={useCaseListPrompt}
        modelValue={useCaseListModel}
        setPromptValue={setUseCaseListPrompt}
        setModelValue={setUseCaseListModel}
        modelLabel="Modèle pour la génération de liste"
      />
      
      <PromptCard
        title="Prompt pour le détail d'un cas d'usage"
        description="Ce prompt sera utilisé pour générer le contenu détaillé d'un cas d'usage. Utilisez {{use_case}} pour le cas d'usage sélectionné, {{user_input}} pour le contexte utilisateur et {{matrix}} pour la matrice de valeur/complexité."
        promptValue={useCaseDetailPrompt}
        modelValue={useCaseDetailModel}
        setPromptValue={setUseCaseDetailPrompt}
        setModelValue={setUseCaseDetailModel}
        modelLabel="Modèle pour les détails de cas d'usage"
      />
      
      <PromptCard
        title="Prompt pour la génération de noms de dossiers"
        description="Ce prompt sera utilisé pour générer automatiquement un nom et une description pour les nouveaux dossiers. Utilisez {{user_input}} comme placeholder pour l'entrée de l'utilisateur."
        promptValue={folderNamePrompt}
        modelValue={folderNameModel}
        setPromptValue={setFolderNamePrompt}
        setModelValue={setFolderNameModel}
        modelLabel="Modèle pour les noms de dossiers"
      />

      <PromptCard
        title="Prompt pour l'auto-remplissage d'entreprise"
        description="Ce prompt sera utilisé pour rechercher et compléter automatiquement les informations d'une entreprise. Utilisez {{company_name}} comme placeholder pour le nom de l'entreprise."
        promptValue={companyInfoPrompt}
        modelValue={companyInfoModel}
        setPromptValue={setCompanyInfoPrompt}
        setModelValue={setCompanyInfoModel}
        modelLabel="Modèle pour l'auto-remplissage d'entreprise"
      />
      
      <ActionButtons
        onReset={resetPrompts}
        onSave={handleSave}
      />
    </div>
  );
};

export default Settings;
