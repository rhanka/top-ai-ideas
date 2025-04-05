
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Calendar, User, Lightbulb, LineChart, AlertTriangle, ListTodo, Database } from "lucide-react";
import { toast } from "sonner";
import { UseCase, ValueRating, ComplexityRating } from "@/types";

const UseCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCases, updateUseCase, matrixConfig } = useAppContext();
  
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const foundUseCase = useCases.find(uc => uc.id === id);
    if (foundUseCase) {
      setUseCase({ ...foundUseCase });
    } else {
      navigate('/cas-usage');
      toast.error("Cas d'usage non trouvé");
    }
  }, [id, useCases, navigate]);
  
  const handleInputChange = (field: keyof UseCase, value: string | string[]) => {
    if (!useCase) return;
    
    if (field === 'benefits' || field === 'metrics' || field === 'risks' || field === 'nextSteps' || field === 'sources') {
      // Handle array fields
      let arrayValue: string[];
      if (typeof value === 'string') {
        // Split by new line if it's a string input
        arrayValue = value.split('\n').filter(item => item.trim() !== '');
      } else {
        arrayValue = value;
      }
      
      setUseCase({ ...useCase, [field]: arrayValue });
    } else {
      // Handle string fields
      setUseCase({ ...useCase, [field]: value });
    }
  };
  
  const handleRatingChange = (
    isValue: boolean,
    axisId: string,
    rating: number
  ) => {
    if (!useCase) return;
    
    // Find the appropriate description from the matrix configuration
    let description = "";
    if (isValue) {
      const axis = matrixConfig.valueAxes.find(axis => axis.name === axisId);
      if (axis && axis.levelDescriptions) {
        const levelDescription = axis.levelDescriptions.find(level => level.level === rating);
        description = levelDescription?.description || "";
      }
      
      const newValueScores = useCase.valueScores.map(score => 
        score.axisId === axisId 
          ? { ...score, rating: rating as ValueRating, description } 
          : score
      );
      setUseCase({ ...useCase, valueScores: newValueScores });
    } else {
      const axis = matrixConfig.complexityAxes.find(axis => axis.name === axisId);
      if (axis && axis.levelDescriptions) {
        const levelDescription = axis.levelDescriptions.find(level => level.level === rating);
        description = levelDescription?.description || "";
      }
      
      const newComplexityScores = useCase.complexityScores.map(score => 
        score.axisId === axisId 
          ? { ...score, rating: rating as ComplexityRating, description } 
          : score
      );
      setUseCase({ ...useCase, complexityScores: newComplexityScores });
    }
  };
  
  const handleSave = () => {
    if (!useCase) return;
    
    updateUseCase(useCase);
    setIsEditing(false);
    toast.success("Cas d'usage mis à jour");
  };
  
  const renderValueRating = (axisId: string) => {
    if (!useCase) return null;
    
    const score = useCase.valueScores.find(s => s.axisId === axisId);
    if (!score) return null;
    
    // Find the axis in the matrix config
    const axis = matrixConfig.valueAxes.find(axis => axis.name === axisId);
    
    return (
      <>
        <div className="flex mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => isEditing && handleRatingChange(true, axisId, star)}
              disabled={!isEditing}
              className={`text-2xl ${star <= score.rating ? "text-yellow-500" : "text-gray-300"} ${isEditing ? "cursor-pointer hover:text-yellow-400" : "cursor-default"}`}
            >
              ★
            </button>
          ))}
        </div>
        
        {/* Show the description based on the rating from matrix config */}
        <p className="text-sm text-gray-600">
          {score.description}
        </p>
      </>
    );
  };
  
  const renderComplexityRating = (axisId: string) => {
    if (!useCase) return null;
    
    const score = useCase.complexityScores.find(s => s.axisId === axisId);
    if (!score) return null;
    
    // Find the axis in the matrix config
    const axis = matrixConfig.complexityAxes.find(axis => axis.name === axisId);
    
    return (
      <>
        <div className="flex mb-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => isEditing && handleRatingChange(false, axisId, level)}
              disabled={!isEditing}
              className={`text-xl font-bold mx-1 ${level <= score.rating ? "text-gray-800" : "text-gray-300"} ${isEditing ? "cursor-pointer hover:text-gray-600" : "cursor-default"}`}
            >
              X
            </button>
          ))}
        </div>
        
        {/* Show the description based on the rating from matrix config */}
        <p className="text-sm text-gray-600">
          {score.description}
        </p>
      </>
    );
  };
  
  if (!useCase) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <p>Chargement...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/cas-usage')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-3xl font-bold text-navy">
            {isEditing ? (
              <Input
                value={useCase.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="font-bold text-2xl h-auto py-2"
              />
            ) : (
              useCase.name
            )}
          </h1>
        </div>
        
        <div className="flex space-x-4">
          {isEditing ? (
            <Button 
              onClick={handleSave}
              className="bg-navy hover:bg-navy/90"
            >
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Modifier
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={useCase.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[150px]"
                />
              ) : (
                <p className="whitespace-pre-line">{useCase.description}</p>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-green-600" />
                  Bénéfices recherchés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={useCase.benefits.join('\n')}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Un élément par ligne"
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {useCase.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5 text-blue-600" />
                  Mesures du succès
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={useCase.metrics.join('\n')}
                    onChange={(e) => handleInputChange('metrics', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Un élément par ligne"
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {useCase.metrics.map((metric, index) => (
                      <li key={index}>{metric}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                  Risques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={useCase.risks.join('\n')}
                    onChange={(e) => handleInputChange('risks', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Un élément par ligne"
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {useCase.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center">
                  <ListTodo className="mr-2 h-5 w-5 text-purple-600" />
                  Prochaines étapes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={useCase.nextSteps.join('\n')}
                    onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Un élément par ligne"
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {useCase.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={useCase.sources.join('\n')}
                  onChange={(e) => handleInputChange('sources', e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Un élément par ligne"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {useCase.sources.map((source, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                      <Database className="h-3 w-3 mr-1" />
                      {source}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50">
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Identifiant:</p>
                <p className="font-medium">{useCase.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Domaine:</p>
                {isEditing ? (
                  <Input
                    value={useCase.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{useCase.domain}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Technologie:</p>
                {isEditing ? (
                  <Input
                    value={useCase.technology}
                    onChange={(e) => handleInputChange('technology', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{useCase.technology}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                {isEditing ? (
                  <Input
                    value={useCase.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{useCase.deadline}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                {isEditing ? (
                  <Input
                    value={useCase.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Contact"
                  />
                ) : (
                  <p className="font-medium">{useCase.contact || "Non défini"}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-yellow-50">
              <CardTitle>Axes de Valeur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {useCase.valueScores.map(score => (
                <div key={score.axisId}>
                  <p className="font-medium mb-1">{score.axisId}</p>
                  {renderValueRating(score.axisId)}
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-gray-100">
              <CardTitle>Axes de Complexité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {useCase.complexityScores.map(score => (
                <div key={score.axisId}>
                  <p className="font-medium mb-1">{score.axisId}</p>
                  {renderComplexityRating(score.axisId)}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UseCaseDetail;
