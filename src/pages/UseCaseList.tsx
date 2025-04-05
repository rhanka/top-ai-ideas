
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { UseCase } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UseCaseList: React.FC = () => {
  const { 
    useCases, 
    setActiveUseCase, 
    deleteUseCase, 
    matrixConfig,
    currentFolderId,
    getCurrentFolder
  } = useAppContext();
  
  const navigate = useNavigate();
  const [useCaseToDelete, setUseCaseToDelete] = useState<UseCase | null>(null);
  
  // Filtrer les cas d'usage pour n'afficher que ceux du dossier actif
  const currentFolder = getCurrentFolder();
  const filteredUseCases = currentFolderId 
    ? useCases.filter(useCase => useCase.folderId === currentFolderId) 
    : [];
  
  const handleCreateNew = () => {
    toast.info("Fonctionnalité de création manuelle à venir");
    // Future implementation for manual creation
  };
  
  const handleViewDetails = (useCase: UseCase) => {
    setActiveUseCase(useCase);
    navigate(`/cas-usage/${useCase.id}`);
  };

  const handleDeleteClick = (useCase: UseCase, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents triggering the card click
    setUseCaseToDelete(useCase);
  };

  const confirmDelete = () => {
    if (useCaseToDelete) {
      deleteUseCase(useCaseToDelete.id);
      toast.success(`Cas d'usage "${useCaseToDelete.name}" supprimé`);
      setUseCaseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setUseCaseToDelete(null);
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
        <div>
          <h1 className="text-3xl font-bold text-navy">Cas d'usage IA</h1>
          {currentFolder && (
            <p className="text-gray-600 mt-1">
              Dossier: {currentFolder.name}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/dossiers')}
            variant="outline" 
            className="mr-2"
          >
            <FolderOpen className="mr-2 h-5 w-5" /> Voir les dossiers
          </Button>
          
          <Button 
            onClick={handleCreateNew} 
            className="bg-navy hover:bg-navy/90"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Nouveau cas d'usage
          </Button>
        </div>
      </div>
      
      {!currentFolder ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun dossier sélectionné</h3>
          <p className="text-gray-500 mb-6">Veuillez sélectionner un dossier pour voir ses cas d'usage</p>
          <Button 
            onClick={() => navigate('/dossiers')}
            variant="outline"
          >
            Voir les dossiers
          </Button>
        </div>
      ) : filteredUseCases.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun cas d'usage</h3>
          <p className="text-gray-500 mb-6">Ce dossier ne contient aucun cas d'usage. Générez-en depuis la page d'accueil.</p>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
          >
            Retour à l'accueil
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUseCases.map((useCase) => (
            <Card 
              key={useCase.id} 
              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(useCase)}
            >
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                <CardTitle className="text-navy text-xl flex items-center justify-between">
                  <span className="truncate">{useCase.name}</span>
                  <span className="text-sm text-gray-600 font-normal">{useCase.id.substring(0, 8)}</span>
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
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(useCase);
                    }} 
                    variant="outline" 
                    className="flex-1 mr-2"
                  >
                    Voir les détails
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-500 hover:bg-red-50"
                    size="icon"
                    onClick={(e) => handleDeleteClick(useCase, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={useCaseToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le cas d'usage "{useCaseToDelete?.name}" ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UseCaseList;
