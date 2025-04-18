
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface ConcurrencyCardProps {
  concurrencyValue: number;
  setConcurrencyValue: (value: number) => void;
  retryAttemptsValue: number;
  setRetryAttemptsValue: (value: number) => void;
}

const ConcurrencyCard: React.FC<ConcurrencyCardProps> = ({
  concurrencyValue,
  setConcurrencyValue,
  retryAttemptsValue,
  setRetryAttemptsValue
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Paramètres de parallélisation</CardTitle>
        <CardDescription>
          Configurez les paramètres de requêtes à l'API OpenAI lors de la génération de cas d'usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
          
          <Separator className="my-2" />
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="retry-slider" className="text-sm font-medium">
              Nombre de tentatives en cas d'échec: <span className="font-bold">{retryAttemptsValue}</span>
            </label>
            <Slider
              id="retry-slider"
              defaultValue={[retryAttemptsValue]}
              min={0}
              max={5}
              step={1}
              onValueChange={(values) => setRetryAttemptsValue(values[0])}
              aria-label="Nombre de tentatives en cas d'échec"
            />
            <p className="text-xs text-gray-500">
              Nombre de tentatives de réessai en cas d'échec d'une requête API.
              <br />
              Recommandation: 2-3 tentatives maximum.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConcurrencyCard;
