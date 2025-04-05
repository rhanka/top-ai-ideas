import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Calendar, User, Lightbulb, LineChart, AlertTriangle, ListTodo, Database, FileText, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UseCase, ValueRating, ComplexityRating, LevelDescription } from "@/types";
import { RatingsTable } from "@/components/UseCaseDetail/RatingsTable";
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

const UseCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCases, updateUseCase, deleteUseCase, matrixConfig } = useAppContext();
  
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [levelDescriptions, setLevelDescriptions] = useState<Record<string, LevelDescription[]>>({});
  const [totalValueScore, setTotalValueScore] = useState<number>(0);
  const [totalComplexityScore, setTotalComplexityScore] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    const foundUseCase = useCases.find(uc => uc.id === id);
    if (foundUseCase) {
      setUseCase({ ...foundUseCase });
      setTotalValueScore(foundUseCase.totalValueScore || 0);
      setTotalComplexityScore(foundUseCase.totalComplexityScore || 0);
    } else {
      navigate('/cas-usage');
      toast.error("Cas d'usage non trouvé");
    }
    
    const descriptionsMap: Record<string, LevelDescription[]> = {};
    
    matrixConfig.valueAxes.forEach(axis => {
      if (axis.levelDescriptions) {
        descriptionsMap[axis.name] = axis.levelDescriptions;
      }
    });
    
    matrixConfig.complexityAxes.forEach(axis => {
      if (axis.levelDescriptions) {
        descriptionsMap[axis.name] = axis.levelDescriptions;
      }
    });
    
    setLevelDescriptions(descriptionsMap);
  }, [id, useCases, navigate, matrixConfig]);
  
  const handleInputChange = (field: keyof UseCase, value: string | string[]) => {
    if (!useCase) return;
    
    if (field === 'benefits' || field === 'metrics' || field === 'risks' || field === 'nextSteps' || field === 'sources' || field === 'relatedData') {
      let arrayValue: string[];
      if (typeof value === 'string') {
        arrayValue = value.split('\n').filter(item => item.trim() !== '');
      } else {
        arrayValue = value;
      }
      
      setUseCase({ ...useCase, [field]: arrayValue });
    } else {
      setUseCase({ ...useCase, [field]: value });
    }
  };
  
  const calculateScores = (updatedUseCase: UseCase) => {
    let valueScore = 0;
    let complexityScore = 0;
    
    updatedUseCase.valueScores.forEach(score => {
      const axis = matrixConfig.valueAxes.find(a => a.name === score.axisId);
      if (axis) {
        let points = 0;
        if (matrixConfig.valueThresholds) {
          const threshold = matrixConfig.valueThresholds.find(t => t.level === score.rating);
          points = threshold ? threshold.points : 0;
        }
        valueScore += points * axis.weight;
      }
    });
    
    updatedUseCase.complexityScores.forEach(score => {
      const axis = matrixConfig.complexityAxes.find(a => a.name === score.axisId);
      if (axis) {
        let points = 0;
        if (matrixConfig.complexityThresholds) {
          const threshold = matrixConfig.complexityThresholds.find(t => t.level === score.rating);
          points = threshold ? threshold.points : 0;
        }
        complexityScore += points * axis.weight;
      }
    });
    
    return { valueScore, complexityScore };
  };
  
  const handleRatingChange = (
    isValue: boolean,
    axisId: string,
    rating: number
  ) => {
    if (!useCase) return;
    
    let description = "";
    let updatedUseCase = { ...useCase };
    
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
      
      updatedUseCase = { ...useCase, valueScores: newValueScores };
      setUseCase(updatedUseCase);
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
      
      updatedUseCase = { ...useCase, complexityScores: newComplexityScores };
      setUseCase(updatedUseCase);
    }
    
    const { valueScore, complexityScore } = calculateScores(updatedUseCase);
    setTotalValueScore(valueScore);
    setTotalComplexityScore(complexityScore);
  };
  
  const handleSave = () => {
    if (!useCase) return;
    
    const { valueScore, complexityScore } = calculateScores(useCase);
    
    const finalUseCase = {
      ...useCase,
      totalValueScore: valueScore,
      totalComplexityScore: complexityScore
    };
    
    updateUseCase(finalUseCase);
    setIsEditing(false);
    toast.success("Cas d'usage mis à jour");
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (useCase) {
      deleteUseCase(useCase.id);
      toast.success(`Cas d'usage "${useCase.name}" supprimé`);
      navigate('/cas-usage');
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const getValueLevel = (score: number | undefined) => {
    if (score === undefined || !matrixConfig.valueThresholds) return 0;
    
    for (let i = matrixConfig.valueThresholds.length - 1; i >= 0; i--) {
      const threshold = matrixConfig.valueThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1;
  };
  
  const getComplexityLevel = (score: number | undefined) => {
    if (score === undefined || !matrixConfig.complexityThresholds) return 0;
    
    for (let i = matrixConfig.complexityThresholds.length - 1; i >= 0; i--) {
      const threshold = matrixConfig.complexityThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1;
  };
  
  const renderValueStars = (score: number | undefined) => {
    if (score === undefined) return "N/A";
    
    const level = getValueLevel(score);
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-5 w-5 ${star <= level ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">({score} points)</span>
      </div>
    );
  };
  
  const renderComplexityX = (score: number | undefined) => {
    if (score === undefined) return "N/A";
    
    const level = getComplexityLevel(score);
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((x) => (
          <span 
            key={x} 
            className={`font-bold text-lg mr-1 ${x <= level ? "text-gray-800" : "text-gray-300"}`}
          >
            X
          </span>
        ))}
        <span className="ml-2 text-sm font-medium">({score} points)</span>
      </div>
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
            <>
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                Modifier
              </Button>
              <Button 
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-md">
          <CardHeader className="bg-yellow-50 pb-3">
            <CardTitle className="text-sm">Valeur calculée</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {renderValueStars(isEditing ? totalValueScore : useCase.totalValueScore)}
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="bg-gray-100 pb-3">
            <CardTitle className="text-sm">Complexité calculée</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {renderComplexityX(isEditing ? totalComplexityScore : useCase.totalComplexityScore)}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                  withMargin={true}
                />
              ) : (
                <p className="whitespace-pre-line mt-2">{useCase.description}</p>
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
                    withMargin={true}
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1 mt-2">
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
                    withMargin={true}
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1 mt-2">
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
                    withMargin={true}
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1 mt-2">
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
                    withMargin={true}
                  />
                ) : (
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {useCase.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
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
                  withMargin={true}
                />
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
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
          
          <Card className="shadow-md">
            <CardHeader className="bg-blue-100">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Données associées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={useCase.relatedData ? useCase.relatedData.join('\n') : ''}
                  onChange={(e) => handleInputChange('relatedData', e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Identité client, factures, historique d'appels... (un élément par ligne)"
                  withMargin={true}
                />
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {useCase.relatedData && useCase.relatedData.length > 0 ? (
                    useCase.relatedData.map((data, index) => (
                      <span key={index} className="bg-blue-50 px-3 py-1 rounded-full text-sm flex items-center border border-blue-200">
                        <FileText className="h-3 w-3 mr-1 text-blue-500" />
                        {data}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Aucune donnée associée</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <RatingsTable 
          title="Axes de Valeur"
          scores={useCase.valueScores}
          isValue={true}
          isEditing={isEditing}
          backgroundColor="bg-yellow-50"
          levelDescriptions={levelDescriptions}
          onRatingChange={handleRatingChange}
          totalScore={isEditing ? totalValueScore : useCase.totalValueScore}
          level={getValueLevel(isEditing ? totalValueScore : useCase.totalValueScore)}
        />
        
        <RatingsTable 
          title="Axes de Complexité"
          scores={useCase.complexityScores}
          isValue={false}
          isEditing={isEditing}
          backgroundColor="bg-gray-100"
          levelDescriptions={levelDescriptions}
          onRatingChange={handleRatingChange}
          totalScore={isEditing ? totalComplexityScore : useCase.totalComplexityScore}
          level={getComplexityLevel(isEditing ? totalComplexityScore : useCase.totalComplexityScore)}
        />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le cas d'usage "{useCase.name}" ?
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

export default UseCaseDetail;
