import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase } from "@/types";
import { Separator } from "@/components/ui/separator";

interface ChessboardProps {
  useCases: UseCase[];
}

export const Chessboard: React.FC<ChessboardProps> = ({ useCases }) => {
  // Scoring thresholds based on the Excel image
  const valueThresholds = [
    { min: 0, max: 40, level: 1, points: 0, threshold: 300, cases: 1 },
    { min: 41, max: 100, level: 2, points: 40, threshold: 700, cases: 4 },
    { min: 101, max: 400, level: 3, points: 100, threshold: 1000, cases: 2 },
    { min: 401, max: 2000, level: 4, points: 400, threshold: 1500, cases: 5 },
    { min: 2001, max: Infinity, level: 5, points: 2000, threshold: 4000, cases: 1 }
  ];
  
  const complexityThresholds = [
    { min: 0, max: 50, level: 1, points: 0, threshold: 100, cases: 0 },
    { min: 51, max: 100, level: 2, points: 50, threshold: 250, cases: 2 },
    { min: 101, max: 250, level: 3, points: 100, threshold: 500, cases: 4 },
    { min: 251, max: 1000, level: 4, points: 250, threshold: 1000, cases: 5 },
    { min: 1001, max: Infinity, level: 5, points: 1000, threshold: 2000, cases: 2 }
  ];
  
  // Categorize use cases based on value and complexity scores
  const categorizeUseCases = () => {
    const grid: UseCase[][] = Array(5).fill(0).map(() => Array(5).fill(0).map(() => [] as unknown as UseCase));
    
    useCases.forEach(useCase => {
      // Skip if scores aren't defined
      if (useCase.totalValueScore === undefined || useCase.totalComplexityScore === undefined) return;
      
      let valueCategory = 0;
      for (let i = 0; i < valueThresholds.length; i++) {
        if (useCase.totalValueScore >= valueThresholds[i].min && 
            useCase.totalValueScore <= valueThresholds[i].max) {
          valueCategory = i;
          break;
        }
      }
      
      let complexityCategory = 0;
      for (let i = 0; i < complexityThresholds.length; i++) {
        if (useCase.totalComplexityScore >= complexityThresholds[i].min && 
            useCase.totalComplexityScore <= complexityThresholds[i].max) {
          complexityCategory = i;
          break;
        }
      }
      
      // Add to appropriate grid cell
      const cellArray = grid[4 - valueCategory][complexityCategory] as unknown as UseCase[];
      cellArray.push(useCase);
    });
    
    return grid;
  };
  
  const grid = categorizeUseCases();
  
  // Color schemes based on position (strategic value)
  const getBackgroundColor = (valueIndex: number, complexityIndex: number) => {
    // High value (5★), low complexity (X) - best scenario
    if (valueIndex === 0 && complexityIndex === 0) return "bg-green-200";
    
    // High value zones (4-5★)
    if ((valueIndex === 0 || valueIndex === 1) && complexityIndex <= 2) return "bg-green-100";
    
    // Medium value, low complexity - good options
    if ((valueIndex === 2) && complexityIndex <= 1) return "bg-green-50";
    
    // Low value (1-2★), high complexity (4-5X) - worst scenario
    if ((valueIndex >= 3) && complexityIndex >= 3) return "bg-red-100";
    
    // Medium cases with higher complexity - caution
    if (complexityIndex >= 3) return "bg-orange-50";
    
    // Other cases - neutral
    return "bg-gray-50";
  };
  
  // Render stars for value level
  const renderValueStars = (valueIndex: number) => {
    const stars = 5 - valueIndex;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level} className={`text-lg ${level <= stars ? "text-yellow-500" : "text-gray-200"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };
  
  // Render X's for complexity level
  const renderComplexityX = (complexityIndex: number) => {
    const crosses = complexityIndex + 1;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level} className={`font-bold ${level <= crosses ? "text-gray-800" : "text-gray-200"}`}>
            X
          </span>
        ))}
      </div>
    );
  };
  
  // Strategic advice based on position
  const getAdvice = (valueIndex: number, complexityIndex: number) => {
    // Value 5★ (highest)
    if (valueIndex === 0) {
      if (complexityIndex === 0) return "Priorité maximale";
      if (complexityIndex === 1) return "Haute priorité";
      if (complexityIndex === 2) return "Planifier rapidement";
      if (complexityIndex === 3) return "Étudier simplification";
      return "Rechercher alternatives";
    }
    
    // Value 4★
    if (valueIndex === 1) {
      if (complexityIndex === 0) return "Haute priorité";
      if (complexityIndex === 1) return "Priorité élevée";
      if (complexityIndex === 2) return "Planifier à moyen terme";
      if (complexityIndex === 3) return "Évaluer options";
      return "Simplifier ou reporter";
    }
    
    // Value 3★
    if (valueIndex === 2) {
      if (complexityIndex === 0) return "Implémenter rapidement";
      if (complexityIndex === 1) return "Bonne initiative";
      if (complexityIndex === 2) return "Évaluer l'effort/valeur";
      if (complexityIndex === 3) return "Simplification nécessaire";
      return "Probablement à éviter";
    }
    
    // Value 2★
    if (valueIndex === 3) {
      if (complexityIndex === 0) return "Quick-win secondaire";
      if (complexityIndex === 1) return "Considérer si ressources";
      if (complexityIndex === 2) return "Faible priorité";
      if (complexityIndex === 3) return "Très faible priorité";
      return "Ne pas poursuivre";
    }
    
    // Value 1★ (lowest)
    if (complexityIndex === 0) return "Effort minime si ressources";
    if (complexityIndex === 1) return "Très faible priorité";
    return "Ne pas poursuivre";
  };
  
  // Get the threshold information for cell
  const getThresholdInfo = (valueIndex: number, complexityIndex: number) => {
    const valueLevel = 5 - valueIndex;
    const complexityLevel = complexityIndex + 1;
    
    const valueData = valueThresholds[valueLevel - 1];
    const complexityData = complexityThresholds[complexityLevel - 1];
    
    return {
      valuePoints: valueData?.points || "N/A",
      valueThreshold: valueData?.threshold || "N/A",
      valueCases: valueData?.cases || 0,
      complexityPoints: complexityData?.points || "N/A",
      complexityThreshold: complexityData?.threshold || "N/A",
      complexityCases: complexityData?.cases || 0
    };
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Matrice stratégique Valeur/Complexité</span>
          <div className="text-sm font-normal text-gray-500">
            Basée sur 5 niveaux par axe
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Matrix header - Complexity levels */}
        <div className="flex mb-2">
          <div className="w-32"></div>
          <div className="grid grid-cols-5 flex-1 gap-2">
            {[0, 1, 2, 3, 4].map((complexityIndex) => (
              <div key={`header-${complexityIndex}`} className="text-center">
                <div className="font-medium text-gray-700">Complexité</div>
                {renderComplexityX(complexityIndex)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Matrix rows */}
        {[0, 1, 2, 3, 4].map((valueIndex) => (
          <div key={`row-${valueIndex}`} className="flex mb-2">
            {/* Value level indicator */}
            <div className="w-32 flex flex-col justify-center items-center">
              <div className="font-medium text-gray-700">Valeur</div>
              {renderValueStars(valueIndex)}
            </div>
            
            {/* Matrix cells */}
            <div className="grid grid-cols-5 flex-1 gap-2">
              {[0, 1, 2, 3, 4].map((complexityIndex) => {
                const useCasesInCell = grid[valueIndex][complexityIndex] as unknown as UseCase[];
                const thresholdInfo = getThresholdInfo(valueIndex, complexityIndex);
                
                return (
                  <div
                    key={`cell-${valueIndex}-${complexityIndex}`}
                    className={`p-2 rounded-lg ${getBackgroundColor(valueIndex, complexityIndex)}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {getAdvice(valueIndex, complexityIndex)}
                    </div>
                    
                    <Separator className="my-1" />
                    
                    {useCasesInCell.length > 0 ? (
                      <ul className="text-xs space-y-1 mt-2 max-h-20 overflow-y-auto">
                        {useCasesInCell.map(useCase => (
                          <li key={useCase.id} className="truncate" title={useCase.name}>
                            <span className="font-mono text-xs mr-1">{useCase.id}</span>
                            {useCase.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 mt-2">Aucun cas</p>
                    )}
                    
                    <div className="mt-2 pt-1 border-t border-gray-200 text-xs text-right text-gray-500">
                      {useCasesInCell.length} cas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Note: Les axes ont 5 niveaux avec des poids différents selon la criticité et la difficulté.</p>
        </div>
      </CardContent>
    </Card>
  );
};
