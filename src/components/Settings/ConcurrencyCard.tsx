
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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
  // Handlers pour les sliders
  const handleConcurrencyChange = (values: number[]) => {
    setConcurrencyValue(values[0]);
  };
  
  const handleRetryAttemptsChange = (values: number[]) => {
    setRetryAttemptsValue(values[0]);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Paramètres de parallélisation</CardTitle>
        <CardDescription>
          Définissez le nombre maximum de requêtes parallèles à l'API OpenAI et les tentatives en cas d'échec
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
              onValueChange={handleConcurrencyChange}
              aria-label="Nombre de requêtes parallèles"
            />
            <p className="text-xs text-gray-500">
              Une valeur plus élevée accélère la génération mais peut entraîner des limitations de l'API.
              <br />
              Recommandation: 3-5 requêtes parallèles.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 mt-4">
            <label htmlFor="retry-slider" className="text-sm font-medium">
              Nombre de tentatives en cas d'échec: <span className="font-bold">{retryAttemptsValue}</span>
            </label>
            <Slider
              id="retry-slider"
              defaultValue={[retryAttemptsValue]}
              min={1}
              max={5}
              step={1}
              onValueChange={handleRetryAttemptsChange}
              aria-label="Nombre de tentatives en cas d'échec"
            />
            <p className="text-xs text-gray-500">
              Nombre de fois qu'une requête sera réessayée avant d'être considérée comme échouée.
              <br />
              Recommandation: 3 tentatives maximum.
            </p>
          </div>
          
          <Alert variant="default" className="mt-4 bg-blue-50 border-blue-100">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              Ces paramètres sont appliqués immédiatement lors de la sauvegarde des réglages.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConcurrencyCard;
