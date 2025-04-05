
import React, { useState, useEffect } from "react";
import { Save, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const OPENAI_API_KEY = "openai_api_key";

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedKey = localStorage.getItem(OPENAI_API_KEY);
    if (savedKey) {
      setApiKey(savedKey);
      setSaved(true);
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
        variant: "warning",
      });
    }

    // Save key to localStorage
    localStorage.setItem(OPENAI_API_KEY, apiKey);
    setSaved(true);
    
    toast({
      title: "Succès",
      description: "La clé API OpenAI a été enregistrée",
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Card className="max-w-2xl mx-auto">
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
    </div>
  );
};

export default Settings;
