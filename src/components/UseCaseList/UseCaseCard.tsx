
import React from "react";
import { UseCase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface UseCaseCardProps {
  useCase: UseCase;
  onViewDetails: (useCase: UseCase) => void;
  onDeleteClick: (useCase: UseCase, e: React.MouseEvent) => void;
  renderValueRating: (score: number | undefined) => React.ReactNode;
  renderComplexityRating: (score: number | undefined) => React.ReactNode;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ 
  useCase, 
  onViewDetails, 
  onDeleteClick,
  renderValueRating,
  renderComplexityRating
}) => {
  return (
    <Card 
      key={useCase.id} 
      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails(useCase)}
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
              onViewDetails(useCase);
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
            onClick={(e) => onDeleteClick(useCase, e)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UseCaseCard;
