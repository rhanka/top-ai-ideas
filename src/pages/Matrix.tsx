
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { ComplexityAxis, ValueAxis } from "@/types";

const Matrix: React.FC = () => {
  const { matrixConfig, updateMatrixConfig } = useAppContext();
  const [editedConfig, setEditedConfig] = useState({ ...matrixConfig });
  
  const handleValueWeightChange = (index: number, weight: string) => {
    const newWeight = parseFloat(weight);
    if (isNaN(newWeight)) return;
    
    const newValueAxes = [...editedConfig.valueAxes];
    newValueAxes[index] = { ...newValueAxes[index], weight: newWeight };
    setEditedConfig({ ...editedConfig, valueAxes: newValueAxes });
  };
  
  const handleComplexityWeightChange = (index: number, weight: string) => {
    const newWeight = parseFloat(weight);
    if (isNaN(newWeight)) return;
    
    const newComplexityAxes = [...editedConfig.complexityAxes];
    newComplexityAxes[index] = { ...newComplexityAxes[index], weight: newWeight };
    setEditedConfig({ ...editedConfig, complexityAxes: newComplexityAxes });
  };
  
  const saveChanges = () => {
    updateMatrixConfig(editedConfig);
    toast.success("Configuration de la matrice mise à jour");
  };
  
  const renderValueLevels = (stars: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level} className={`text-xl ${level <= stars ? "text-yellow-500" : "text-gray-300"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };
  
  const renderComplexityLevels = (crosses: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level} className={`font-bold ${level <= crosses ? "text-gray-800" : "text-gray-300"}`}>
            X
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-navy">Configuration de la Matrice Valeur/Complexité</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex">
          <Info className="h-6 w-6 text-blue-500 mr-2" />
          <p>
            Ajustez les poids des axes de valeur et de complexité pour personnaliser l'évaluation des cas d'usage. Des poids plus élevés donnent plus d'importance à un critère.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Value Axes Configuration */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-navy to-blue-700">
            <CardTitle className="text-white flex items-center">
              <span className="mr-2">Axes de Valeur</span>
              {renderValueLevels(3)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-1/2">Critère</TableHead>
                  <TableHead className="w-1/4">Poids</TableHead>
                  <TableHead className="w-1/4">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedConfig.valueAxes.map((axis, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{axis.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={axis.weight}
                        onChange={(e) => handleValueWeightChange(index, e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{axis.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Complexity Axes Configuration */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900">
            <CardTitle className="text-white flex items-center">
              <span className="mr-2">Axes de Complexité</span>
              {renderComplexityLevels(3)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-1/2">Critère</TableHead>
                  <TableHead className="w-1/4">Poids</TableHead>
                  <TableHead className="w-1/4">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedConfig.complexityAxes.map((axis, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{axis.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={axis.weight}
                        onChange={(e) => handleComplexityWeightChange(index, e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{axis.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
        <div className="flex">
          <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
          <p>
            Attention : Modifier les poids recalculera automatiquement tous les scores de vos cas d'usage existants.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveChanges}
          className="bg-navy hover:bg-navy/90"
        >
          <Save className="mr-2 h-4 w-4" /> Enregistrer la configuration
        </Button>
      </div>
    </div>
  );
};

export default Matrix;
