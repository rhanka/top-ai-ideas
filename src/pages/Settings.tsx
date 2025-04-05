
import React, { useState, useEffect } from "react";
import { Save, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  OPENAI_API_KEY, 
  USE_CASE_LIST_PROMPT, 
  USE_CASE_DETAIL_PROMPT, 
  FOLDER_NAME_PROMPT,
  USE_CASE_LIST_MODEL,
  USE_CASE_DETAIL_MODEL,
  FOLDER_NAME_MODEL,
  DEFAULT_LIST_MODEL,
  DEFAULT_DETAIL_MODEL,
  DEFAULT_FOLDER_MODEL,
  DEFAULT_USE_CASE_LIST_PROMPT,
  DEFAULT_USE_CASE_DETAIL_PROMPT,
  DEFAULT_FOLDER_NAME_PROMPT,
  OPENAI_MODELS
} from "@/context/constants";

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [useCaseListPrompt, setUseCaseListPrompt] = useState<string>(DEFAULT_USE_CASE_LIST_PROMPT);
  const [useCaseDetailPrompt, setUseCaseDetailPrompt] = useState<string>(DEFAULT_USE_CASE_DETAIL_PROMPT);
  const [folderNamePrompt, setFolderNamePrompt] = useState<string>(DEFAULT_FOLDER_NAME_PROMPT);
  
  // Model selection states
  const [useCaseListModel, setUseCaseListModel] = useState<string>(DEFAULT_LIST_MODEL);
  const [useCaseDetailModel, setUseCaseDetailModel] = useState<string>(DEFAULT_DETAIL_MODEL);
  const [folderNameModel, setFolderNameModel] = useState<string>(DEFAULT_FOLDER_MODEL);
  
  const [saved, setSaved] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved values from localStorage on component mount
    const savedKey = localStorage.getItem(OPENAI_API_KEY);
    const savedListPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT);
    const savedDetailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT);
    const savedFolderNamePrompt = localStorage.getItem(FOLDER_NAME_PROMPT);
    
    // Load saved model selections
    const savedListModel = localStorage.getItem(USE_CASE_LIST_MODEL);
    const savedDetailModel = localStorage.getItem(USE_CASE_DETAIL_MODEL);
    const savedFolderModel = localStorage.getItem(FOLDER_NAME_MODEL);
    
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
    
    // Save model selections
    localStorage.setItem(USE_CASE_LIST_MODEL, useCaseListModel);
    localStorage.setItem(USE_CASE_DETAIL_MODEL, useCaseDetailModel);
    localStorage.setItem(FOLDER_NAME_MODEL, folderNameModel);
    
    setSaved(true);
    
    toast({
      title: "Succès",
      description: "Les paramètres ont été enregistrés",
      variant: "default",
    });
  };

  const handleRemove = () => {
    localStorage.removeItem(OPENAI_API_KEY);
    setApiKey("");
    setSaved(false);
    
    toast({
      title: "Supprimée",
      description: "La clé API OpenAI a été supprimée",
      variant: "default",
    });
  };

  const resetPrompts = () => {
    setUseCaseListPrompt(DEFAULT_USE_CASE_LIST_PROMPT);
    setUseCaseDetailPrompt(DEFAULT_USE_CASE_DETAIL_PROMPT);
    setFolderNamePrompt(DEFAULT_FOLDER_NAME_PROMPT);
    
    // Reset models to defaults
    setUseCaseListModel(DEFAULT_LIST_MODEL);
    setUseCaseDetailModel(DEFAULT_DETAIL_MODEL);
    setFolderNameModel(DEFAULT_FOLDER_MODEL);
    
    toast({
      title: "Prompts réinitialisés",
      description: "Les prompts et modèles ont été réinitialisés aux valeurs par défaut",
      variant: "default",
    });
  };

  // Helper component for model selection
  const ModelSelector = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: string; 
    onChange: (value: string) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez un modèle" />
        </SelectTrigger>
        <SelectContent>
          {OPENAI_MODELS.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration de l'API OpenAI</CardTitle>
          <CardDescription>
            Entrez votre clé API OpenAI pour activer les fonctionnalités d'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input 
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="sk-..."
                className="pr-10"
              />
              {saved && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <Check size={18} />
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <AlertCircle className="inline-block mr-1" size={14} />
              Votre clé API est stockée uniquement sur votre appareil.
            </div>
            
            <div className="flex gap-2 justify-end">
              {apiKey && (
                <Button 
                  variant="outline" 
                  onClick={handleRemove}
                  className="flex gap-1"
                >
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </Button>
              )}
              <Button onClick={handleSave} className="flex gap-1">
                <Save size={16} />
                <span>Enregistrer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prompt pour la liste de cas d'usage</CardTitle>
          <CardDescription>
            Ce prompt sera utilisé pour générer une liste de cas d'usage à partir de l'entrée utilisateur. 
            Utilisez {"{{user_input}}"} comme placeholder pour l'entrée de l'utilisateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              value={useCaseListPrompt}
              onChange={(e) => setUseCaseListPrompt(e.target.value)}
              placeholder="Entrez votre prompt personnalisé..."
              className="min-h-[150px]"
            />
            
            <ModelSelector
              value={useCaseListModel}
              onChange={setUseCaseListModel}
              label="Modèle pour la génération de liste"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prompt pour le détail d'un cas d'usage</CardTitle>
          <CardDescription>
            Ce prompt sera utilisé pour générer le contenu détaillé d'un cas d'usage. 
            Utilisez {"{{use_case}}"} pour le cas d'usage sélectionné, {"{{user_input}}"} pour le contexte utilisateur
            et {"{{matrix}}"} pour la matrice de valeur/complexité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              value={useCaseDetailPrompt}
              onChange={(e) => setUseCaseDetailPrompt(e.target.value)}
              placeholder="Entrez votre prompt personnalisé..."
              className="min-h-[200px]"
            />
            
            <ModelSelector
              value={useCaseDetailModel}
              onChange={setUseCaseDetailModel}
              label="Modèle pour les détails de cas d'usage"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prompt pour la génération de noms de dossiers</CardTitle>
          <CardDescription>
            Ce prompt sera utilisé pour générer automatiquement un nom et une description pour les nouveaux dossiers.
            Utilisez {"{{user_input}}"} comme placeholder pour l'entrée de l'utilisateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              value={folderNamePrompt}
              onChange={(e) => setFolderNamePrompt(e.target.value)}
              placeholder="Entrez votre prompt personnalisé..."
              className="min-h-[150px]"
            />
            
            <ModelSelector
              value={folderNameModel}
              onChange={setFolderNameModel}
              label="Modèle pour les noms de dossiers"
            />
            
            <div className="mt-4 flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={resetPrompts}
                className="flex gap-1"
              >
                <Trash2 size={16} />
                <span>Réinitialiser les prompts</span>
              </Button>
              <Button onClick={handleSave} className="flex gap-1">
                <Save size={16} />
                <span>Enregistrer tous les paramètres</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
