
import React, { useState, useEffect } from "react";
import { Save, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const OPENAI_API_KEY = "openai_api_key";
const USE_CASE_LIST_PROMPT = "use_case_list_prompt";
const USE_CASE_DETAIL_PROMPT = "use_case_detail_prompt";

// Default prompts with placeholders
const DEFAULT_USE_CASE_LIST_PROMPT = 
`Génère une liste de 5 cas d'usage d'IA innovants pour le domaine suivant: {{user_input}}.
Pour chaque cas d'usage, propose un titre court et explicite.
Format: liste numérotée sans description.`;

const DEFAULT_USE_CASE_DETAIL_PROMPT = 
`Génère un cas d'usage détaillé pour "{{use_case}}" basé sur cette matrice valeur/complexité: {{matrix}}.
Inclus:
- Titre: un titre clair et concis
- Description: explication détaillée du cas d'usage
- Objectifs: 3-5 objectifs principaux
- Bénéfices: avantages concrets pour l'organisation
- Challenges: principaux défis techniques et organisationnels
- Ressources: compétences et outils nécessaires
- Timeline: estimation du temps de mise en œuvre
- Indicateurs de succès: 3-4 KPIs mesurables`;

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [useCaseListPrompt, setUseCaseListPrompt] = useState<string>(DEFAULT_USE_CASE_LIST_PROMPT);
  const [useCaseDetailPrompt, setUseCaseDetailPrompt] = useState<string>(DEFAULT_USE_CASE_DETAIL_PROMPT);
  const [saved, setSaved] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved values from localStorage on component mount
    const savedKey = localStorage.getItem(OPENAI_API_KEY);
    const savedListPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT);
    const savedDetailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT);
    
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
    
    toast({
      title: "Prompts réinitialisés",
      description: "Les prompts ont été réinitialisés aux valeurs par défaut",
      variant: "default",
    });
  };

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
          <Textarea 
            value={useCaseListPrompt}
            onChange={(e) => setUseCaseListPrompt(e.target.value)}
            placeholder="Entrez votre prompt personnalisé..."
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prompt pour le détail d'un cas d'usage</CardTitle>
          <CardDescription>
            Ce prompt sera utilisé pour générer le contenu détaillé d'un cas d'usage. 
            Utilisez {"{{use_case}}"} pour le cas d'usage sélectionné et {"{{matrix}}"} pour la matrice de valeur/complexité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={useCaseDetailPrompt}
            onChange={(e) => setUseCaseDetailPrompt(e.target.value)}
            placeholder="Entrez votre prompt personnalisé..."
            className="min-h-[200px]"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
