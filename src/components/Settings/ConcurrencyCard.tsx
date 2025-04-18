
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Slider
} from "@/components/ui/slider";

interface ConcurrencyCardProps {
  concurrency: number;
  setConcurrency: (value: number) => void;
}

const ConcurrencyCard: React.FC<ConcurrencyCardProps> = ({
  concurrency,
  setConcurrency,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Requêtes parallèles</CardTitle>
        <CardDescription>Définir le nombre maximal de requêtes à traiter simultanément vers l'API OpenAI</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nombre de requêtes parallèles</span>
              <span className="font-bold text-lg">{concurrency}</span>
            </div>
            
            <Slider
              value={[concurrency]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setConcurrency(value[0])}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
            <p className="font-medium">Recommandations:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Une valeur plus élevée peut accélérer la génération, mais consomme plus d'API credits</li>
              <li>Une valeur plus basse est plus économique mais prend plus de temps</li>
              <li>La valeur recommandée est de 3 à 5 requêtes en parallèle</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConcurrencyCard;
