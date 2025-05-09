import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase, LevelThreshold } from "@/types";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/AppContext";

interface ChessboardProps {
  useCases: UseCase[];
}

export const Chessboard: React.FC<ChessboardProps> = ({ useCases }) => {
  const { matrixConfig } = useAppContext();
  
  // Get thresholds from context
  const valueThresholds = matrixConfig.valueThresholds || [];
  const complexityThresholds = matrixConfig.complexityThresholds || [];
  
  // Helper function to determine value level based on thresholds
  const getValueLevel = (score: number | undefined) => {
    if (score === undefined || !valueThresholds) return 0;
    
    for (let i = valueThresholds.length - 1; i >= 0; i--) {
      const threshold = valueThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1; // Default minimum level
  };
  
  // Helper function to determine complexity level based on thresholds
  const getComplexityLevel = (score: number | undefined) => {
    if (score === undefined || !complexityThresholds) return 0;
    
    for (let i = complexityThresholds.length - 1; i >= 0; i--) {
      const threshold = complexityThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1; // Default minimum level
  };
  
  // Categorize use cases based on value and complexity levels
  const categorizeUseCases = () => {
    const grid: UseCase[][] = Array(5).fill(0).map(() => Array(5).fill(0).map(() => [] as unknown as UseCase));
    
    useCases.forEach(useCase => {
      // Skip if scores aren't defined
      if (useCase.totalValueScore === undefined || useCase.totalComplexityScore === undefined) return;
      
      const valueLevel = getValueLevel(useCase.totalValueScore);
      const complexityLevel = getComplexityLevel(useCase.totalComplexityScore);
      
      if (valueLevel === 0 || complexityLevel === 0) return;
      
      // Add to appropriate grid cell (5★ at top, 5X at LEFT now - inverted from previous)
      const valueIndex = 5 - valueLevel;
      // Reverse the complexity index to show highest complexity first
      const complexityIndex = 5 - complexityLevel;
      
      const cellArray = grid[valueIndex][complexityIndex] as unknown as UseCase[];
      cellArray.push(useCase);
    });
    
    return grid;
  };
  
  const grid = categorizeUseCases();
  
  // Color schemes based on position (strategic value)
  const getBackgroundColor = (valueIndex: number, complexityIndex: number) => {
    // High value (5★), low complexity (X) - best scenario
    // Note: Now low complexity is at RIGHT (high index)
    if (valueIndex === 0 && complexityIndex === 4) return "bg-green-200";
    
    // High value zones (4-5★)
    if ((valueIndex === 0 || valueIndex === 1) && complexityIndex >= 2) return "bg-green-100";
    
    // Medium value, low complexity - good options
    if ((valueIndex === 2) && complexityIndex >= 3) return "bg-green-50";
    
    // Low value (1-2★), high complexity (4-5X) - worst scenario
    if ((valueIndex >= 3) && complexityIndex <= 1) return "bg-red-100";
    
    // Medium cases with higher complexity - caution
    if (complexityIndex <= 1) return "bg-orange-50";
    
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
  
  // Render X's for complexity level - now in inverse order
  const renderComplexityX = (complexityIndex: number) => {
    // Invert the X rendering to match the new order (highest complexity first)
    const crosses = 5 - complexityIndex;
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
      if (complexityIndex === 4) return "Priorité maximale";
      if (complexityIndex === 3) return "Haute priorité";
      if (complexityIndex === 2) return "Planifier rapidement";
      if (complexityIndex === 1) return "Étudier simplification";
      return "Rechercher alternatives";
    }
    
    // Value 4★
    if (valueIndex === 1) {
      if (complexityIndex === 4) return "Haute priorité";
      if (complexityIndex === 3) return "Priorité élevée";
      if (complexityIndex === 2) return "Planifier à moyen terme";
      if (complexityIndex === 1) return "Évaluer options";
      return "Simplifier ou reporter";
    }
    
    // Value 3★
    if (valueIndex === 2) {
      if (complexityIndex === 4) return "Implémenter rapidement";
      if (complexityIndex === 3) return "Bonne initiative";
      if (complexityIndex === 2) return "Évaluer l'effort/valeur";
      if (complexityIndex === 1) return "Simplification nécessaire";
      return "Probablement à éviter";
    }
    
    // Value 2★
    if (valueIndex === 3) {
      if (complexityIndex === 4) return "Quick-win secondaire";
      if (complexityIndex === 3) return "Considérer si ressources";
      if (complexityIndex === 2) return "Faible priorité";
      if (complexityIndex === 1) return "Très faible priorité";
      return "Ne pas poursuivre";
    }
    
    // Value 1★ (lowest)
    if (complexityIndex === 4) return "Effort minime si ressources";
    if (complexityIndex === 3) return "Très faible priorité";
    return "Ne pas poursuivre";
  };
  
  // Get the threshold information for cell
  const getThresholdInfo = (valueIndex: number, complexityIndex: number) => {
    const valueLevel = 5 - valueIndex;
    // Adjust the complexity level calculation for the inverted display
    const complexityLevel = 5 - complexityIndex;
    
    const valueData = valueThresholds.find(t => t.level === valueLevel);
    const complexityData = complexityThresholds.find(t => t.level === complexityLevel);
    
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
        {/* Matrix header - Complexity levels - now in reverse order */}
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
          <p>Note: L'attribution des étoiles/X est basée sur les seuils de points configurés dans la page Matrice.</p>
        </div>
      </CardContent>
    </Card>
  );
};
