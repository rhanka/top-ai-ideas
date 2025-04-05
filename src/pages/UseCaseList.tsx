
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { UseCase } from "@/types";

const UseCaseList: React.FC = () => {
  const { useCases, setActiveUseCase, deleteUseCase } = useAppContext();
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    toast.info("Fonctionnalité de création manuelle à venir");
    // Future implementation for manual creation
  };
  
  const handleViewDetails = (useCase: UseCase) => {
    setActiveUseCase(useCase);
    navigate(`/cas-usage/${useCase.id}`);
  };
  
  // Function to render value rating as stars based on score - corrected threshold logic
  const renderValueRating = (score: number | undefined) => {
    if (!score) return "N/A";
    
    // Determine level based on value thresholds
    const thresholds = [0, 40, 100, 400, 1500];
    let level = 1;
    
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (score > thresholds[i] && score <= thresholds[i + 1]) {
        level = i + 1;
        break;
      } else if (score > thresholds[i + 1]) {
        level = i + 2;
      }
    }
    
    level = Math.min(level, 5); // Ensure level doesn't exceed 5
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-lg ${star <= level ? "text-yellow-500" : "text-gray-300"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };
  
  // Function to render complexity rating as X's based on score - corrected threshold logic
  const renderComplexityRating = (score: number | undefined) => {
    if (!score) return "N/A";
    
    // Determine level based on complexity thresholds
    const thresholds = [0, 50, 100, 250, 500];
    let level = 1;
    
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (score > thresholds[i] && score <= thresholds[i + 1]) {
        level = i + 1;
        break;
      } else if (score > thresholds[i + 1]) {
        level = i + 2;
      }
    }
    
    level = Math.min(level, 5); // Ensure level doesn't exceed 5
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((x) => (
          <span key={x} className={`font-bold ${x <= level ? "text-gray-800" : "text-gray-300"}`}>
            X
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-navy">Cas d'usage IA</h1>
        
        <Button 
          onClick={handleCreateNew} 
          className="bg-navy hover:bg-navy/90"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Nouveau cas d'usage
        </Button>
      </div>
      
      {useCases.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun cas d'usage</h3>
          <p className="text-gray-500 mb-6">Commencez par générer des cas d'usage depuis la page d'accueil</p>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
          >
            Retour à l'accueil
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <Card key={useCase.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                <CardTitle className="text-navy text-xl flex items-center justify-between">
                  <span className="truncate">{useCase.name}</span>
                  <span className="text-sm text-gray-600 font-normal">{useCase.id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Domaine:</p>
                  <p className="font-medium">{useCase.domain}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description:</p>
                  <p className="text-sm line-clamp-3">{useCase.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Valeur:</p>
                    {renderValueRating(useCase.totalValueScore)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Complexité:</p>
                    {renderComplexityRating(useCase.totalComplexityScore)}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={() => handleViewDetails(useCase)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Voir les détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UseCaseList;
