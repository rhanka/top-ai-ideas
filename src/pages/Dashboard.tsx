import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Chessboard } from "@/components/Dashboard/Chessboard";

const Dashboard: React.FC = () => {
  const { useCases, matrixConfig, currentFolderId, getCurrentFolder } = useAppContext();
  
  const currentFolder = getCurrentFolder();
  
  // Filter use cases for current folder only
  const currentFolderUseCases = useCases.filter(useCase => useCase.folderId === currentFolderId);
  
  // Get the maximum possible values for both axes
  const valueThresholds = matrixConfig.valueThresholds || [];
  const complexityThresholds = matrixConfig.complexityThresholds || [];
  
  // Find max possible values from thresholds
  const maxPossibleValueScore = valueThresholds.length > 0 
    ? Math.max(...valueThresholds.map(t => t.max || 0))
    : 40; // Default fallback
    
  const maxPossibleComplexityScore = complexityThresholds.length > 0 
    ? Math.max(...complexityThresholds.map(t => t.max || 0))
    : 30; // Default fallback
  
  // Find actual maximum scores from current folder's use cases
  const actualMaxValueScore = currentFolderUseCases.length > 0
    ? Math.max(...currentFolderUseCases.map(uc => uc.totalValueScore || 0))
    : maxPossibleValueScore;
    
  const actualMaxComplexityScore = currentFolderUseCases.length > 0
    ? Math.max(...currentFolderUseCases.map(uc => uc.totalComplexityScore || 0))
    : maxPossibleComplexityScore;
  
  // Prepare data for scatter plot with normalized scores
  const scatterData = currentFolderUseCases.map(useCase => {
    // Normalize the scores to a 0-100 scale
    const normalizedValue = useCase.totalValueScore 
      ? (useCase.totalValueScore / actualMaxValueScore) * 100
      : 0;
      
    // Normalize complexity (inverted to get "ease of implementation")
    const complexityScore = useCase.totalComplexityScore || 0;
    const normalizedComplexity = (complexityScore / actualMaxComplexityScore) * 100;
    const easeOfImplementation = 100 - normalizedComplexity; // Invert for ease
    
    return {
      name: useCase.name,
      id: useCase.id,
      value: Math.round(normalizedValue),
      ease: Math.round(easeOfImplementation),
      process: useCase.process,
      // Keep original scores for tooltip
      originalValue: useCase.totalValueScore,
      originalEase: maxPossibleComplexityScore - (useCase.totalComplexityScore || 0),
    };
  });
  
  // Colors for different categories
  const colorMap: {[key: string]: string} = {
    "Opérations": "#ef4444", // red
    "Maintenance": "#f97316", // orange
    "Logistique": "#3b82f6", // blue
    "Finance": "#8b5cf6", // purple
    "default": "#6b7280", // gray
  };
  
  // Get color based on process
  const getProcessColor = (process: string) => {
    return colorMap[process] || colorMap.default;
  };
  
  // Create process categories for legend
  const processes = [...new Set(currentFolderUseCases.map(useCase => useCase.process))];
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">Dashboard Cas d'usage</h1>
        {currentFolder && (
          <p className="text-gray-600 mt-1">
            Dossier: {currentFolder.name}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Nombre total de cas d'usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-navy">{currentFolderUseCases.length}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Score moyen de valeur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-600">
              {currentFolderUseCases.length 
                ? Math.round((currentFolderUseCases.reduce((sum, useCase) => sum + (useCase.totalValueScore || 0), 0) / currentFolderUseCases.length) * 10) / 10
                : 0
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Score moyen de complexité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-red-600">
              {currentFolderUseCases.length 
                ? Math.round((currentFolderUseCases.reduce((sum, useCase) => sum + (useCase.totalComplexityScore || 0), 0) / currentFolderUseCases.length) * 10) / 10
                : 0
              }
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Projection Valeur / Facilité d'implémentation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    dataKey="ease" 
                    name="Facilité d'implémentation" 
                    domain={[0, 100]}
                    label={{ value: "Facilité d'implémentation (%)", position: "insideBottom", offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="value" 
                    name="Valeur" 
                    domain={[0, 100]}
                    label={{ value: "Valeur (%)", angle: -90, position: "insideLeft" }}
                  />
                  <ZAxis type="category" dataKey="name" />
                  <Tooltip 
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name, props) => {
                      const item = props.payload;
                      if (name === "value") {
                        return [`${item.originalValue} (${value}%)`, "Valeur"];
                      }
                      if (name === "ease") {
                        return [`${item.originalEase} (${value}%)`, "Facilité"];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => label}
                    contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "6px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                  />
                  <Legend
                    payload={processes.map(process => ({
                      value: process,
                      type: "circle",
                      color: getProcessColor(process),
                    }))}
                  />
                  <Scatter name="Cas d'usage" data={scatterData} fill="#8884d8">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getProcessColor(entry.process)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Chessboard useCases={currentFolderUseCases} />
      </div>
    </div>
  );
};

export default Dashboard;
