
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Building2, Edit, Tag, Users, Package2, Workflow, Lightbulb, Target, Cpu } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CompanyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, getSectorById, getProcessesByIds } = useAppContext();
  
  // Trouver l'entreprise correspondante
  const company = companies.find(c => c.id === id);
  
  // Rediriger si l'entreprise n'existe pas
  if (!company) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Entreprise non trouvée</h1>
        <p className="mb-6">L'entreprise que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button onClick={() => navigate('/entreprises')}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour à la liste
        </Button>
      </div>
    );
  }
  
  // Récupérer le secteur de l'entreprise
  const sector = getSectorById(company.sectorId);
  
  // Récupérer les processus associés à l'entreprise
  const associatedProcesses = company.businessProcesses?.length 
    ? getProcessesByIds(company.businessProcesses) 
    : [];
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate('/entreprises')} className="mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
          <h1 className="text-3xl font-bold text-navy flex items-center">
            <Building2 className="inline-block mr-2 h-8 w-8" />
            {company.name}
          </h1>
          {sector && (
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {sector.name}
              </Badge>
            </div>
          )}
        </div>
        <Button onClick={() => navigate(`/entreprises`)} variant="outline" className="self-start sm:self-auto">
          <Edit className="w-4 h-4 mr-2" /> Modifier
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              Secteur d'activité
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p>{company.industry}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="w-4 h-4 mr-2 text-gray-500" />
              Taille
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p>{company.size}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Package2 className="w-4 h-4 mr-2 text-gray-500" />
              Produits et services
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="whitespace-pre-wrap">{company.products}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Workflow className="w-4 h-4 mr-2 text-gray-500" />
              Processus métier
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {associatedProcesses.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {associatedProcesses.map(process => (
                    <Badge key={process.id} variant="secondary">
                      {process.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">
                  {company.processes}
                </p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{company.processes || "Aucun processus spécifié"}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Lightbulb className="w-4 h-4 mr-2 text-gray-500" />
              Défis
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="whitespace-pre-wrap">{company.challenges}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Target className="w-4 h-4 mr-2 text-gray-500" />
              Objectifs
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="whitespace-pre-wrap">{company.objectives}</p>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Cpu className="w-4 h-4 mr-2 text-gray-500" />
              Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="whitespace-pre-wrap">{company.technologies}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyView;
