
import React from 'react';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { List, Plus } from 'lucide-react';

const BusinessConfiguration: React.FC = () => {
  const { sectors, processes, saveSectors, saveProcesses, resetToDefaults } = useBusinessConfig();

  const handleReset = () => {
    resetToDefaults();
    toast.success("Configuration réinitialisée");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Configuration Métier</h1>
        <p className="text-gray-600">
          Gérez les secteurs d'activité et processus métier disponibles dans l'application
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Secteurs d'activité</span>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {sectors.map(sector => (
                <li key={sector.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{sector.name}</h3>
                    <p className="text-sm text-gray-600">{sector.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Processus métier</span>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {processes.map(process => (
                <li key={process.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{process.name}</h3>
                    <p className="text-sm text-gray-600">{process.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={handleReset}>
          <List className="h-4 w-4 mr-2" />
          Réinitialiser aux valeurs par défaut
        </Button>
      </div>
    </div>
  );
};

export default BusinessConfiguration;
