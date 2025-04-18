
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ConcurrencyCardProps {
  concurrencyValue: number;
  setConcurrencyValue: (value: number) => void;
}

const ConcurrencyCard: React.FC<ConcurrencyCardProps> = ({
  concurrencyValue,
  setConcurrencyValue
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Paramètres de parallélisation</CardTitle>
        <CardDescription>
          Définissez le nombre maximum de requêtes parallèles à l'API OpenAI lors de la génération de cas d'usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="concurrency-slider" className="text-sm font-medium">
              Nombre de requêtes parallèles: <span className="font-bold">{concurrencyValue}</span>
            </label>
            <Slider
              id="concurrency-slider"
              defaultValue={[concurrencyValue]}
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => setConcurrencyValue(values[0])}
              aria-label="Nombre de requêtes parallèles"
            />
            <p className="text-xs text-gray-500">
              Une valeur plus élevée accélère la génération mais peut entraîner des limitations de l'API.
              <br />
              Recommandation: 3-5 requêtes parallèles.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConcurrencyCard;
