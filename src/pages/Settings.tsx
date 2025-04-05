
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
const FOLDER_NAME_PROMPT = "folder_name_prompt";

// Default prompts with placeholders
const DEFAULT_USE_CASE_LIST_PROMPT = 
`Génère une liste de 5 cas d'usage d'IA innovants pour le domaine suivant: {{user_input}}.
Pour chaque cas d'usage, propose un titre court et explicite.
Format: liste numérotée sans description.`;

const DEFAULT_USE_CASE_DETAIL_PROMPT = 
`Génère un cas d'usage détaillé pour "{{use_case}}" dans le contexte suivant: {{user_input}}. Utilise la matrice valeur/complexité fournie: {{matrix}} pour évaluer chaque axe de valeur et complexité.

La réponse doit impérativement contenir tous les éléments suivants au format JSON:

{
  "name": "{{use_case}}",
  "description": "Description détaillée du cas d'usage sur 5-10 lignes",
  "domain": "Le domaine d'application principal",
  "technology": "Technologies d'IA à utiliser (NLP, Computer Vision, etc.)",
  "deadline": "Estimation du délai de mise en œuvre (ex: Q3 2025)",
  "contact": "Nom du responsable suggéré",
  "benefits": [
    "Bénéfice 1",
    "Bénéfice 2",
    "Bénéfice 3",
    "Bénéfice 4",
    "Bénéfice 5"
  ],
  "metrics": [
    "KPI ou mesure de succès 1",
    "KPI ou mesure de succès 2",
    "KPI ou mesure de succès 3"
  ],
  "risks": [
    "Risque 1",
    "Risque 2",
    "Risque 3"
  ],
  "nextSteps": [
    "Étape 1",
    "Étape 2",
    "Étape 3",
    "Étape 4"
  ],
  "sources": [
    "Source de données 1",
    "Source de données 2"
  ],
  "relatedData": [
    "Donnée associée 1",
    "Donnée associée 2",
    "Donnée associée 3"
  ],
  "valueScores": [
    {
      "axisId": "Nom du 1er axe de valeur",
      "rating": 4,
      "description": "Justification du score"
    },
    {
      "axisId": "Nom du 2ème axe de valeur",
      "rating": 3,
      "description": "Justification du score"
    }
    // Complète pour les autres axes de valeur présents dans la matrice
  ],
  "complexityScores": [
    {
      "axisId": "Nom du 1er axe de complexité",
      "rating": 2,
      "description": "Justification du score"
    },
    {
      "axisId": "Nom du 2ème axe de complexité",
      "rating": 4,
      "description": "Justification du score"
    }
    // Complète pour les autres axes de complexité présents dans la matrice
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans texte avant ou après. Veille à ce que chaque axe de la matrice fournie ait bien son score correspondant dans les sections valueScores et complexityScores.`;

const DEFAULT_FOLDER_NAME_PROMPT = 
`Génère un nom et une brève description pour un dossier qui contiendra des cas d'usage d'IA pour le contexte suivant: {{user_input}}.
Le nom doit être court et représentatif du domaine ou secteur d'activité principal.
La description doit expliquer en 1-2 phrases le contenu du dossier.
Format de réponse en JSON:
{
  "name": "Nom du dossier (4-6 mots max)",
  "description": "Description concise du dossier (20-30 mots max)"
}`;

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [useCaseListPrompt, setUseCaseListPrompt] = useState<string>(DEFAULT_USE_CASE_LIST_PROMPT);
  const [useCaseDetailPrompt, setUseCaseDetailPrompt] = useState<string>(DEFAULT_USE_CASE_DETAIL_PROMPT);
  const [folderNamePrompt, setFolderNamePrompt] = useState<string>(DEFAULT_FOLDER_NAME_PROMPT);
  const [saved, setSaved] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved values from localStorage on component mount
    const savedKey = localStorage.getItem(OPENAI_API_KEY);
    const savedListPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT);
    const savedDetailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT);
    const savedFolderNamePrompt = localStorage.getItem(FOLDER_NAME_PROMPT);
    
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
            Utilisez {"{{use_case}}"} pour le cas d'usage sélectionné, {"{{user_input}}"} pour le contexte utilisateur
            et {"{{matrix}}"} pour la matrice de valeur/complexité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={useCaseDetailPrompt}
            onChange={(e) => setUseCaseDetailPrompt(e.target.value)}
            placeholder="Entrez votre prompt personnalisé..."
            className="min-h-[200px]"
          />
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
          <Textarea 
            value={folderNamePrompt}
            onChange={(e) => setFolderNamePrompt(e.target.value)}
            placeholder="Entrez votre prompt personnalisé..."
            className="min-h-[150px]"
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
