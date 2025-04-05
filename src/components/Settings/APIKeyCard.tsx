
import React, { useState } from "react";
import { Save, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { OPENAI_API_KEY } from "@/context/constants";

interface APIKeyCardProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  saved: boolean;
  setSaved: (saved: boolean) => void;
  handleSave: () => void;
}

const APIKeyCard: React.FC<APIKeyCardProps> = ({
  apiKey,
  setApiKey,
  saved,
  setSaved,
  handleSave,
}) => {
  const { toast } = useToast();

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
  );
};

export default APIKeyCard;
