
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";
import { UseCase } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import UseCaseCard from "@/components/UseCaseList/UseCaseCard";
import EmptyState from "@/components/UseCaseList/EmptyState";
import UseCaseListHeader from "@/components/UseCaseList/UseCaseListHeader";
import DeleteDialog from "@/components/UseCaseList/DeleteDialog";
import { renderValueRating, renderComplexityRating } from "@/components/UseCaseList/RatingUtils";

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
  const isMobile = useIsMobile();
  const [useCaseToDelete, setUseCaseToDelete] = useState<UseCase | null>(null);
  
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
  
  const renderUseCaseRating = {
    value: (score: number | undefined) => renderValueRating(score, matrixConfig.valueThresholds || []),
    complexity: (score: number | undefined) => renderComplexityRating(score, matrixConfig.complexityThresholds || [])
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <UseCaseListHeader 
        isMobile={isMobile}
        currentFolder={currentFolder}
        handleCreateNew={handleCreateNew}
      />
      
      {!currentFolder ? (
        <EmptyState currentFolder={currentFolder} />
      ) : filteredUseCases.length === 0 ? (
        <EmptyState currentFolder={currentFolder} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUseCases.map((useCase) => (
            <UseCaseCard
              key={useCase.id}
              useCase={useCase}
              onViewDetails={handleViewDetails}
              onDeleteClick={handleDeleteClick}
              renderValueRating={renderUseCaseRating.value}
              renderComplexityRating={renderUseCaseRating.complexity}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        useCaseToDelete={useCaseToDelete}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UseCaseList;
