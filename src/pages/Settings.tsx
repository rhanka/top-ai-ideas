import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import APIKeyCard from "@/components/Settings/APIKeyCard";
import PromptCard from "@/components/Settings/PromptCard";
import ActionButtons from "@/components/Settings/ActionButtons";
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
  USE_CASE_MAX_RETRIES,
  USE_CASE_PARALLEL_QUEUE,
  DEFAULT_USE_CASE_MAX_RETRIES,
  DEFAULT_USE_CASE_PARALLEL_QUEUE,
} from "@/context/constants";

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [useCaseListPrompt, setUseCaseListPrompt] = useState<string>(DEFAULT_USE_CASE_LIST_PROMPT);
  const [useCaseDetailPrompt, setUseCaseDetailPrompt] = useState<string>(DEFAULT_USE_CASE_DETAIL_PROMPT);
  const [folderNamePrompt, setFolderNamePrompt] = useState<string>(DEFAULT_FOLDER_NAME_PROMPT);
  const [companyInfoPrompt, setCompanyInfoPrompt] = useState<string>(DEFAULT_COMPANY_INFO_PROMPT);
  
  const [useCaseListModel, setUseCaseListModel] = useState<string>(DEFAULT_LIST_MODEL);
  const [useCaseDetailModel, setUseCaseDetailModel] = useState<string>(DEFAULT_DETAIL_MODEL);
  const [folderNameModel, setFolderNameModel] = useState<string>(DEFAULT_FOLDER_MODEL);
  const [companyInfoModel, setCompanyInfoModel] = useState<string>(DEFAULT_COMPANY_INFO_MODEL);
  
  const [maxRetries, setMaxRetries] = useState<number>(DEFAULT_USE_CASE_MAX_RETRIES);
  const [parallelQueue, setParallelQueue] = useState<number>(DEFAULT_USE_CASE_PARALLEL_QUEUE);
  
  const [saved, setSaved] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem(OPENAI_API_KEY);
    const savedListPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT);
    const savedDetailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT);
    const savedFolderNamePrompt = localStorage.getItem(FOLDER_NAME_PROMPT);
    const savedCompanyInfoPrompt = localStorage.getItem(COMPANY_INFO_PROMPT);
    
    const savedListModel = localStorage.getItem(USE_CASE_LIST_MODEL);
    const savedDetailModel = localStorage.getItem(USE_CASE_DETAIL_MODEL);
    const savedFolderModel = localStorage.getItem(FOLDER_NAME_MODEL);
    const savedCompanyInfoModel = localStorage.getItem(COMPANY_INFO_MODEL);
    
    const savedMaxRetries = localStorage.getItem(USE_CASE_MAX_RETRIES);
    const savedParallelQueue = localStorage.getItem(USE_CASE_PARALLEL_QUEUE);
    
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
    
    if (savedMaxRetries) setMaxRetries(Number(savedMaxRetries));
    if (savedParallelQueue) setParallelQueue(Number(savedParallelQueue));
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

    if (!apiKey.startsWith("sk-")) {
      toast({
        title: "Attention",
        description: "Le format de clé API semble incorrect",
        variant: "default",
      });
    }

    localStorage.setItem(OPENAI_API_KEY, apiKey);
    localStorage.setItem(USE_CASE_LIST_PROMPT, useCaseListPrompt);
    localStorage.setItem(USE_CASE_DETAIL_PROMPT, useCaseDetailPrompt);
    localStorage.setItem(FOLDER_NAME_PROMPT, folderNamePrompt);
    localStorage.setItem(COMPANY_INFO_PROMPT, companyInfoPrompt);
    
    localStorage.setItem(USE_CASE_LIST_MODEL, useCaseListModel);
    localStorage.setItem(USE_CASE_DETAIL_MODEL, useCaseDetailModel);
    localStorage.setItem(FOLDER_NAME_MODEL, folderNameModel);
    localStorage.setItem(COMPANY_INFO_MODEL, companyInfoModel);
    
    localStorage.setItem(USE_CASE_MAX_RETRIES, String(maxRetries));
    localStorage.setItem(USE_CASE_PARALLEL_QUEUE, String(parallelQueue));
    
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
    
    setUseCaseListModel(DEFAULT_LIST_MODEL);
    setUseCaseDetailModel(DEFAULT_DETAIL_MODEL);
    setFolderNameModel(DEFAULT_FOLDER_MODEL);
    setCompanyInfoModel(DEFAULT_COMPANY_INFO_MODEL);
    
    setMaxRetries(DEFAULT_USE_CASE_MAX_RETRIES);
    setParallelQueue(DEFAULT_USE_CASE_PARALLEL_QUEUE);
    
    toast({
      title: "Prompts réinitialisés",
      description: "Les prompts et modèles ont été réinitialisés aux valeurs par défaut",
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
      
      <div className="mb-8 border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold text-lg mb-2">Paramètres avancés génération</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="maxRetries" className="block text-sm font-medium mb-1">
              Nombre maximal de tentatives par requête
            </label>
            <input
              id="maxRetries"
              type="number"
              min={1}
              max={10}
              step={1}
              className="w-full border rounded px-2 py-1"
              value={maxRetries}
              onChange={e => setMaxRetries(Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="parallelQueue" className="block text-sm font-medium mb-1">
              Nombre de requêtes parallèles (taille de la file)
            </label>
            <input
              id="parallelQueue"
              type="number"
              min={1}
              max={10}
              step={1}
              className="w-full border rounded px-2 py-1"
              value={parallelQueue}
              onChange={e => setParallelQueue(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      <ActionButtons
        onReset={resetPrompts}
        onSave={handleSave}
      />
    </div>
  );
};

export default Settings;
