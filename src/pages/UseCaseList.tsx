
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UseCase } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const UseCaseList: React.FC = () => {
  const { useCases, setActiveUseCase, deleteUseCase, matrixConfig, isGenerating, generationStatus, currentTitle } = useAppContext();
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    toast.info("Fonctionnalité de création manuelle à venir");
    // Future implementation for manual creation
  };
  
  const handleViewDetails = (useCase: UseCase) => {
    setActiveUseCase(useCase);
    navigate(`/cas-usage/${useCase.id}`);
  };
  
  // Function to determine value level based on thresholds
  const getValueLevel = (score: number | undefined) => {
    if (score === undefined || !matrixConfig.valueThresholds) return 0;
    
    // Find the level corresponding to the score
    for (let i = matrixConfig.valueThresholds.length - 1; i >= 0; i--) {
      const threshold = matrixConfig.valueThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1; // Default minimum level
  };
  
  // Function to determine complexity level based on thresholds
  const getComplexityLevel = (score: number | undefined) => {
    if (score === undefined || !matrixConfig.complexityThresholds) return 0;
    
    // Find the level corresponding to the score
    for (let i = matrixConfig.complexityThresholds.length - 1; i >= 0; i--) {
      const threshold = matrixConfig.complexityThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1; // Default minimum level
  };
  
  // Function to render value rating as stars
  const renderValueRating = (score: number | undefined) => {
    if (score === undefined) return "N/A";
    
    const level = getValueLevel(score);
    
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
  
  // Function to render complexity rating as X's
  const renderComplexityRating = (score: number | undefined) => {
    if (score === undefined) return "N/A";
    
    const level = getComplexityLevel(score);
    
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
        
        <div className="flex items-center gap-4">
          {isGenerating && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex flex-col space-y-2 p-2">
                  <p className="font-medium">{generationStatus}</p>
                  {currentTitle && (
                    <p className="text-sm text-gray-500">
                      Cas en cours: <span className="font-medium">{currentTitle}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Les nouveaux cas d'usage apparaîtront automatiquement dans cette liste.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button 
            onClick={handleCreateNew} 
            className="bg-navy hover:bg-navy/90"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Nouveau cas d'usage
          </Button>
        </div>
      </div>
      
      {useCases.length === 0 && !isGenerating ? (
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
            <Card key={useCase.id} className="shadow-md hover:shadow-lg transition-shadow animate-fade-in">
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
                    <div className="flex items-center">
                      {renderValueRating(useCase.totalValueScore)}
                      {useCase.totalValueScore !== undefined && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({useCase.totalValueScore} pts)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Complexité:</p>
                    <div className="flex items-center">
                      {renderComplexityRating(useCase.totalComplexityScore)}
                      {useCase.totalComplexityScore !== undefined && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({useCase.totalComplexityScore} pts)
                        </span>
                      )}
                    </div>
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
          
          {isGenerating && (
            <Card className="shadow-md border-dashed border-2 border-gray-300 flex items-center justify-center p-8 bg-gray-50 opacity-75">
              <div className="text-center flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-navy" />
                <div>
                  <p className="font-medium text-gray-600">Génération en cours</p>
                  <p className="text-sm text-gray-500">{currentTitle || "Préparation..."}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default UseCaseList;
