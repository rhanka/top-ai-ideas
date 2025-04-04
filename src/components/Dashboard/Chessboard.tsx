import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase } from "@/types";

interface ChessboardProps {
  useCases: UseCase[];
}

export const Chessboard: React.FC<ChessboardProps> = ({ useCases }) => {
  // Categorize use cases into a 3x3 grid based on value and complexity
  const categorizeUseCases = () => {
    // Define thresholds for categorization (can be adjusted)
    const valueThresholds = [15, 25]; // Low, Medium, High
    const complexityThresholds = [10, 20]; // Low, Medium, High
    
    const grid: UseCase[][] = Array(3).fill(0).map(() => Array(3).fill(0).map(() => [] as unknown as UseCase));
    
    useCases.forEach(useCase => {
      // Skip if scores aren't defined
      if (useCase.totalValueScore === undefined || useCase.totalComplexityScore === undefined) return;
      
      let valueCategory = 0; // Low by default
      if (useCase.totalValueScore > valueThresholds[1]) valueCategory = 2; // High
      else if (useCase.totalValueScore > valueThresholds[0]) valueCategory = 1; // Medium
      
      let complexityCategory = 0; // Low by default
      if (useCase.totalComplexityScore > complexityThresholds[1]) complexityCategory = 2; // High
      else if (useCase.totalComplexityScore > complexityThresholds[0]) complexityCategory = 1; // Medium
      
      // Add to appropriate grid cell (array of use cases)
      const cellArray = grid[2 - valueCategory][complexityCategory] as unknown as UseCase[];
      cellArray.push(useCase);
    });
    
    return grid;
  };
  
  const grid = categorizeUseCases();
  
  // Color schemes based on position
  const getBackgroundColor = (valueIndex: number, complexityIndex: number) => {
    // High value, low complexity (top right) - best scenario
    if (valueIndex === 0 && complexityIndex === 0) return "bg-green-100";
    
    // Low value, high complexity (bottom left) - worst scenario
    if (valueIndex === 2 && complexityIndex === 2) return "bg-red-100";
    
    // Medium cases
    if ((valueIndex === 0 && complexityIndex === 1) || 
        (valueIndex === 1 && complexityIndex === 0)) return "bg-green-50";
        
    if ((valueIndex === 1 && complexityIndex === 2) || 
        (valueIndex === 2 && complexityIndex === 1)) return "bg-red-50";
    
    // Other cases - neutral
    return "bg-gray-50";
  };
  
  // Title based on position
  const getCellTitle = (valueIndex: number, complexityIndex: number) => {
    const valueLabels = ["Haute", "Moyenne", "Faible"];
    const complexityLabels = ["Faible", "Moyenne", "Haute"];
    
    return `Valeur ${valueLabels[valueIndex]} / Complexité ${complexityLabels[complexityIndex]}`;
  };
  
  // Strategic advice based on position
  const getAdvice = (valueIndex: number, complexityIndex: number) => {
    // High value, low complexity (top right)
    if (valueIndex === 0 && complexityIndex === 0) 
      return "Prioriser immédiatement";
    
    // High value, medium complexity
    if (valueIndex === 0 && complexityIndex === 1) 
      return "Planifier à court terme";
    
    // High value, high complexity
    if (valueIndex === 0 && complexityIndex === 2) 
      return "Étudier des options de simplification";
    
    // Medium value, low complexity
    if (valueIndex === 1 && complexityIndex === 0) 
      return "Quick-win à implémenter";
    
    // Medium value, medium complexity
    if (valueIndex === 1 && complexityIndex === 1) 
      return "Évaluer au cas par cas";
    
    // Medium value, high complexity
    if (valueIndex === 1 && complexityIndex === 2) 
      return "Reporter ou simplifier";
    
    // Low value, low complexity
    if (valueIndex === 2 && complexityIndex === 0) 
      return "Considérer si ressources disponibles";
    
    // Low value, medium complexity
    if (valueIndex === 2 && complexityIndex === 1) 
      return "Bas de la liste de priorités";
    
    // Low value, high complexity (bottom left)
    if (valueIndex === 2 && complexityIndex === 2) 
      return "Ne pas poursuivre";
    
    return "";
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Matrice stratégique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {grid.map((row, valueIndex) => (
            row.map((cell, complexityIndex) => {
              const useCasesInCell = cell as unknown as UseCase[];
              
              return (
                <div 
                  key={`${valueIndex}-${complexityIndex}`}
                  className={`p-4 rounded-lg ${getBackgroundColor(valueIndex, complexityIndex)}`}
                >
                  <h3 className="font-medium text-navy text-sm mb-1">{getCellTitle(valueIndex, complexityIndex)}</h3>
                  <p className="text-xs text-gray-500 italic mb-3">{getAdvice(valueIndex, complexityIndex)}</p>
                  
                  {useCasesInCell.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {useCasesInCell.map(useCase => (
                        <li key={useCase.id} className="truncate" title={useCase.name}>
                          <span className="font-mono text-xs mr-1">{useCase.id}</span>
                          {useCase.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400">Aucun cas d'usage</p>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
