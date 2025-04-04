
import React, { useRef, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Chessboard } from "@/components/Dashboard/Chessboard";

const Dashboard: React.FC = () => {
  const { useCases } = useAppContext();
  
  // Prepare data for scatter plot
  const scatterData = useCases.map(useCase => {
    // Invert complexity to get "ease of implementation"
    const maxComplexityScore = 30; // Approximate max possible score
    const easeOfImplementation = Math.max(maxComplexityScore - (useCase.totalComplexityScore || 0), 0);
    
    return {
      name: useCase.name,
      id: useCase.id,
      value: useCase.totalValueScore || 0,
      ease: easeOfImplementation,
      domain: useCase.domain,
    };
  });
  
  // Colors for different categories
  const colorMap: {[key: string]: string} = {
    "Web": "#ef4444", // red
    "Mobile": "#f97316", // orange
    "Data": "#3b82f6", // blue
    "Généré": "#8b5cf6", // purple
    "default": "#6b7280", // gray
  };
  
  // Get color based on domain
  const getDomainColor = (domain: string) => {
    return colorMap[domain] || colorMap.default;
  };
  
  // Create domain categories for legend
  const domains = [...new Set(useCases.map(useCase => useCase.domain))];
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-navy">Dashboard Cas d'usage</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Nombre total de cas d'usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-navy">{useCases.length}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Score moyen de valeur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-600">
              {useCases.length 
                ? Math.round((useCases.reduce((sum, useCase) => sum + (useCase.totalValueScore || 0), 0) / useCases.length) * 10) / 10
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
              {useCases.length 
                ? Math.round((useCases.reduce((sum, useCase) => sum + (useCase.totalComplexityScore || 0), 0) / useCases.length) * 10) / 10
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
                    domain={[0, 30]}
                    label={{ value: 'Facilité d'implémentation', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="value" 
                    name="Valeur" 
                    domain={[0, 40]}
                    label={{ value: 'Valeur', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="category" dataKey="name" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name, props) => {
                      if (name === "value") return [`${value}`, "Valeur"];
                      if (name === "ease") return [`${value}`, "Facilité"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => label}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    payload={domains.map(domain => ({
                      value: domain,
                      type: "circle",
                      color: getDomainColor(domain),
                    }))}
                  />
                  <Scatter name="Cas d'usage" data={scatterData} fill="#8884d8">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getDomainColor(entry.domain)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Chessboard useCases={useCases} />
      </div>
    </div>
  );
};

export default Dashboard;
