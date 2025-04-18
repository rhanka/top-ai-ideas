
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Folder, ArrowLeft } from 'lucide-react';

const CompanyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { companies, folders } = useAppContext();
  
  const company = companies.find(c => c.id === id);
  const associatedFolders = folders.filter(f => f.companyId === id);
  
  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Entreprise non trouvée
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/entreprises">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="h-6 w-6 mr-2" />
            {company.name}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de l'entreprise</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="font-medium">Secteur d'activité</h3>
            <p className="text-gray-600">{company.industry}</p>
          </div>
          <div>
            <h3 className="font-medium">Taille</h3>
            <p className="text-gray-600">{company.size}</p>
          </div>
          <div>
            <h3 className="font-medium">Produits/Services</h3>
            <p className="text-gray-600">{company.products}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            Dossiers associés
          </CardTitle>
          <CardDescription>
            {associatedFolders.length === 0 
              ? "Aucun dossier associé à cette entreprise" 
              : `${associatedFolders.length} dossier(s) associé(s)`}
          </CardDescription>
        </CardHeader>
        {associatedFolders.length > 0 && (
          <CardContent>
            <div className="grid gap-4">
              {associatedFolders.map(folder => (
                <Link 
                  key={folder.id}
                  to={`/dossiers?folder=${folder.id}`}
                  className="block p-4 rounded-lg border hover:border-navy transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Folder className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{folder.description}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CompanyView;
