import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, AlertCircle, Info, Edit } from "lucide-react";
import { toast } from "sonner";
import { ComplexityAxis, LevelDescription, ValueAxis, LevelThreshold } from "@/types";
import { LevelDescriptionEditor } from "@/components/Matrix/LevelDescriptionEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Value descriptions based on the Excel image - we'll use these as defaults
const defaultValueDescriptions = {
  "Niveau de Sponsorship": [
    "Équipe locale / Aucun sponsor clair",
    "Opérationnel / Gestionnaire 1er niveau",
    "Direction Service Client / TI",
    "Direction Principale / VP Service Client",
    "Vice-Présidence Exécutive / Comité Exécutif"
  ],
  "Impact Satisfaction Client (CSAT/NPS)": [
    "Impact négligeable ou très localisé sur la satisfaction client.",
    "Amélioration mineure d'un point de contact peu fréquent ou irritant mineur.",
    "Réduction notable des irritants sur motifs courants (ex: facturation simple). Impact mesurable sur le CSAT.",
    "Amélioration sensible de l'expérience sur motifs importants (déménagement) OU réduction significative de l'effort client.",
    "Amélioration majeure sur motifs critiques (pannes) OU refonte positive d'un parcours client clé. Fort impact potentiel sur CSAT/NPS."
  ],
  "Gains de Productivité (Agents & Opérations)": [
    "Impact quasi nul sur le TMT (<2%) ou les ETP (<0.5).",
    "Réduction mineure du TMT (2-5%) ou RPC, économie 0.5-1 ETP.",
    "Réduction significative du TMT (5-10%), amélioration du RPC, économie 1-3 ETP.",
    "Réduction importante du TMT (10-15%), automatisation partielle d'une tâche, économie 3-5 ETP.",
    "Réduction majeure du TMT (>15%) ou RPC, forte automatisation/déviation vers self-service, économie > 5 ETP."
  ],
  "Amélioration Expérience Agent & Rétention": [
    "Pas d'impact notable sur le travail de l'agent.",
    "Simplifie une tâche très spécifique ou rarement frustrante.",
    "Simplifie des tâches modérément complexes, réduit le stress sur certains types d'appels, aide à la formation initiale.",
    "Automatise une partie des tâches répétitives, fournit une assistance contextuelle utile.",
    "Automatise tâches frustrantes, assistance temps réel précieuse, réduit la charge cognitive, améliore satisfaction agent."
  ],
  "Conformité & Image Publique": [
    "N/A ou impact neutre.",
    "Aide marginale à la conformité (ex: logging simple).",
    "Aide à maintenir la conformité OU améliore l'image sur un aspect spécifique (ex: transparence facturation).",
    "Renforce la conformité sur un point précis OU améliore l'image sur un sujet sensible.",
    "Renforce significativement la conformité (traçabilité, données) OU améliore l'image publique sur des enjeux clés (pannes)."
  ]
};

// Complexity descriptions based on the Excel image - we'll use these as defaults
const defaultComplexityDescriptions = {
  "Maturité & Fiabilité Solution IA": [
    "Technologie éprouvée et stable pour l'usage (SVI basique).",
    "Technologie éprouvée mais requiert configuration standard (classification simple, chatbot FAQ).",
    "Technologie maîtrisée mais nécessite adaptation/paramétrage fin (chatbot transactionnel). Fiabilité à valider.",
    "Technologie récente ou appliquée de manière nouvelle, nécessite PoC/validation poussée. Fiabilité modérée attendue.",
    "Technologie émergente/expérimentale ou R&D importante. Fiabilité incertaine."
  ],
  "Effort d'Implémentation & Intégration": [
    "Solution quasi \"sur étagère\", intégration minimale via API très simples.",
    "Intégration légère avec 1-2 systèmes via API standard. Configuration simple.",
    "Intégration avec systèmes clés (CRM, téléphonie) via API existantes. Dev/config modéré.",
    "Intégration plus complexe avec plusieurs systèmes (certains moins modernes), création d'API simples, orchestration basique.",
    "Intégration profonde avec multiples systèmes. Dev custom important, création/modif API complexes, orchestration avancée."
  ],
  "IA Responsable & Conformité Données": [
    "Pas ou peu de DP, risque biais faible, pas d'enjeux éthiques majeurs.",
    "Utilisation de DP non sensibles, risque biais faible mais à vérifier, besoin de documentation conformité simple (Loi 25).",
    "Utilisation de DP (Loi 25), pseudonymisation/anonymisation, gestion consentement, tests biais standards, xAI simple.",
    "Utilisation de DP potentiellement sensibles, risque biais modéré nécessitant mitigation active, enjeu C-27/AI Act naissant, transparence accrue.",
    "Utilisation DP sensibles, risque biais élevé, enjeux éthiques importants (décisions importantes), conformité C-27/AI Act stricte, audits complexes, xAI avancées."
  ],
  "Disponibilité, Qualité & Accès Données": [
    "Données centralisées, propres, documentées.",
    "Données dans 1-2 systèmes, qualité bonne, accès simple, léger nettoyage.",
    "Données dans quelques systèmes (<5), nettoyage/rapprochement modéré, qualité acceptable, accès gérable.",
    "Données dans plusieurs systèmes, qualité hétérogène, effort ETL notable, complexité d'accès moyenne.",
    "Données dispersées (>5 systèmes, legacy), faible qualité, gros efforts ETL/qualité, complexité d'accès (sécurité, silos), besoin datamart/lac."
  ],
  "Gestion du Changement & Impact Métier": [
    "Impact minimal sur processus agents, formation rapide/intuitive.",
    "Léger ajustement processus, formation courte nécessaire.",
    "Modification notable processus/outils, formation structurée, communication nécessaire.",
    "Changement important processus, formation approfondie, accompagnement soutenu requis.",
    "Refonte majeure processus, fort impact rôle agent, formation + accompagnement intensifs, plan GOC robuste, implication syndicats (si applicable)."
  ]
};

const Matrix: React.FC = () => {
  const { matrixConfig, updateMatrixConfig, updateThresholds, countUseCasesInLevel } = useAppContext();
  const [editedConfig, setEditedConfig] = useState({ ...matrixConfig });
  const [selectedAxis, setSelectedAxis] = useState<ValueAxis | ComplexityAxis | null>(null);
  const [isValueAxis, setIsValueAxis] = useState(false);
  const [showDescriptionsDialog, setShowDescriptionsDialog] = useState(false);

  // Initialize thresholds if they don't exist
  useEffect(() => {
    if (!editedConfig.valueThresholds || !editedConfig.complexityThresholds) {
      const defaultValueThresholds = [
        { level: 1, min: 0, max: 40, points: 0, threshold: 300, cases: 1 },
        { level: 2, min: 41, max: 100, points: 40, threshold: 700, cases: 4 },
        { level: 3, min: 101, max: 400, points: 100, threshold: 1000, cases: 2 },
        { level: 4, min: 401, max: 2000, points: 400, threshold: 1500, cases: 5 },
        { level: 5, min: 2001, max: Infinity, points: 2000, threshold: 4000, cases: 1 }
      ];

      const defaultComplexityThresholds = [
        { level: 1, min: 0, max: 50, points: 0, threshold: 100, cases: 0 },
        { level: 2, min: 51, max: 100, points: 50, threshold: 250, cases: 2 },
        { level: 3, min: 101, max: 250, points: 100, threshold: 500, cases: 4 },
        { level: 4, min: 251, max: 1000, points: 250, threshold: 1000, cases: 5 },
        { level: 5, min: 1001, max: Infinity, points: 1000, threshold: 2000, cases: 2 }
      ];

      setEditedConfig({
        ...editedConfig,
        valueThresholds: defaultValueThresholds,
        complexityThresholds: defaultComplexityThresholds
      });
    }
  }, [matrixConfig]);

  // Initialize levelDescriptions if they don't exist
  useEffect(() => {
    // Initialize value axes level descriptions
    const newValueAxes = editedConfig.valueAxes.map(axis => {
      if (!axis.levelDescriptions) {
        const defaultDescs = defaultValueDescriptions[axis.name as keyof typeof defaultValueDescriptions] || [];
        const levelDescs = defaultDescs.map((desc, index) => ({
          level: index + 1,
          description: desc || `Niveau ${index + 1}`
        }));
        return { ...axis, levelDescriptions: levelDescs };
      }
      return axis;
    });

    // Initialize complexity axes level descriptions
    const newComplexityAxes = editedConfig.complexityAxes.map(axis => {
      if (!axis.levelDescriptions) {
        const defaultDescs = defaultComplexityDescriptions[axis.name as keyof typeof defaultComplexityDescriptions] || [];
        const levelDescs = defaultDescs.map((desc, index) => ({
          level: index + 1,
          description: desc || `Niveau ${index + 1}`
        }));
        return { ...axis, levelDescriptions: levelDescs };
      }
      return axis;
    });

    setEditedConfig({ 
      ...editedConfig,
      valueAxes: newValueAxes,
      complexityAxes: newComplexityAxes 
    });
  }, [matrixConfig]);
  
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

  // Handle threshold value changes
  const handleThresholdChange = (isValue: boolean, level: number, field: keyof LevelThreshold, value: string | number) => {
    if (isValue && editedConfig.valueThresholds) {
      const newThresholds = [...editedConfig.valueThresholds];
      const index = newThresholds.findIndex(t => t.level === level);
      if (index !== -1) {
        newThresholds[index] = { ...newThresholds[index], [field]: value };
        setEditedConfig({ ...editedConfig, valueThresholds: newThresholds });
      }
    } else if (!isValue && editedConfig.complexityThresholds) {
      const newThresholds = [...editedConfig.complexityThresholds];
      const index = newThresholds.findIndex(t => t.level === level);
      if (index !== -1) {
        newThresholds[index] = { ...newThresholds[index], [field]: value };
        setEditedConfig({ ...editedConfig, complexityThresholds: newThresholds });
      }
    }
  };

  const updateCasesCount = () => {
    if (editedConfig.valueThresholds && editedConfig.complexityThresholds) {
      // Update case counts for value thresholds
      const newValueThresholds = editedConfig.valueThresholds.map(threshold => ({
        ...threshold,
        cases: countUseCasesInLevel(true, threshold.level)
      }));

      // Update case counts for complexity thresholds
      const newComplexityThresholds = editedConfig.complexityThresholds.map(threshold => ({
        ...threshold,
        cases: countUseCasesInLevel(false, threshold.level)
      }));

      setEditedConfig({
        ...editedConfig,
        valueThresholds: newValueThresholds,
        complexityThresholds: newComplexityThresholds
      });
    }
  };

  // Update counts when component mounts
  useEffect(() => {
    updateCasesCount();
  }, [matrixConfig.valueThresholds, matrixConfig.complexityThresholds]);

  const handleUpdateLevelDescription = (levelNum: number, description: string) => {
    if (!selectedAxis) return;
    
    if (isValueAxis) {
      const axisIndex = editedConfig.valueAxes.findIndex(a => a.name === selectedAxis.name);
      if (axisIndex === -1) return;
      
      const newValueAxes = [...editedConfig.valueAxes];
      const currentLevelDescs = [...(newValueAxes[axisIndex].levelDescriptions || [])];
      
      const levelIndex = currentLevelDescs.findIndex(ld => ld.level === levelNum);
      if (levelIndex >= 0) {
        currentLevelDescs[levelIndex] = { ...currentLevelDescs[levelIndex], description };
      } else {
        currentLevelDescs.push({ level: levelNum, description });
      }
      
      newValueAxes[axisIndex] = { 
        ...newValueAxes[axisIndex], 
        levelDescriptions: currentLevelDescs 
      };
      
      setEditedConfig({ ...editedConfig, valueAxes: newValueAxes });
    } else {
      const axisIndex = editedConfig.complexityAxes.findIndex(a => a.name === selectedAxis.name);
      if (axisIndex === -1) return;
      
      const newComplexityAxes = [...editedConfig.complexityAxes];
      const currentLevelDescs = [...(newComplexityAxes[axisIndex].levelDescriptions || [])];
      
      const levelIndex = currentLevelDescs.findIndex(ld => ld.level === levelNum);
      if (levelIndex >= 0) {
        currentLevelDescs[levelIndex] = { ...currentLevelDescs[levelIndex], description };
      } else {
        currentLevelDescs.push({ level: levelNum, description });
      }
      
      newComplexityAxes[axisIndex] = { 
        ...newComplexityAxes[axisIndex], 
        levelDescriptions: currentLevelDescs 
      };
      
      setEditedConfig({ ...editedConfig, complexityAxes: newComplexityAxes });
    }
  };
  
  const saveChanges = () => {
    updateMatrixConfig(editedConfig);
    updateThresholds(editedConfig.valueThresholds, editedConfig.complexityThresholds);
    toast.success("Configuration de la matrice mise à jour");
  };
  
  const openAxisDescriptions = (axis: ValueAxis | ComplexityAxis, isValue: boolean) => {
    setSelectedAxis(axis);
    setIsValueAxis(isValue);
    setShowDescriptionsDialog(true);
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
  
  const getLevelDescription = (axis: ValueAxis | ComplexityAxis, level: number): string => {
    if (!axis.levelDescriptions) return `Niveau ${level}`;
    
    const levelDesc = axis.levelDescriptions.find(ld => ld.level === level);
    return levelDesc?.description || `Niveau ${level}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-navy">Configuration de la Matrice Valeur/Complexité</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex">
          <Info className="h-6 w-6 text-blue-500 mr-2" />
          <div>
            <p className="mb-2">
              Ajustez les poids des axes de valeur et de complexité pour personnaliser l'évaluation des cas d'usage.
            </p>
            <p className="text-sm">
              La matrice utilise 5 niveaux pour chaque critère, avec des descriptions spécifiques pour chacun.
              Cliquez sur un critère pour voir et modifier les descriptions détaillées des 5 niveaux.
            </p>
          </div>
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
                  <TableHead className="w-1/4">Action</TableHead>
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
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openAxisDescriptions(axis, true)}
                      >
                        Voir niveaux
                      </Button>
                    </TableCell>
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
                  <TableHead className="w-1/4">Action</TableHead>
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
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openAxisDescriptions(axis, false)}
                      >
                        Voir niveaux
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Value Threshold Configuration */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-900">
            <CardTitle className="text-white">Configuration des seuils de Valeur</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-purple-50">
                <TableRow>
                  <TableHead className="w-1/5">Valeur</TableHead>
                  <TableHead className="w-1/5">Points</TableHead>
                  <TableHead className="w-2/5">Seuil</TableHead>
                  <TableHead className="w-1/5">Nombre de cas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-gray-100">
                  <TableCell className="font-medium">Poids du critère</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                </TableRow>
                {editedConfig.valueThresholds?.map((threshold) => (
                  <TableRow key={`value-${threshold.level}`}>
                    <TableCell className="font-medium">
                      {renderValueLevels(threshold.level)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={threshold.points}
                        onChange={(e) => handleThresholdChange(true, threshold.level, "points", parseInt(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={threshold.threshold}
                        onChange={(e) => handleThresholdChange(true, threshold.level, "threshold", parseInt(e.target.value))}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {threshold.cases || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Complexity Threshold Configuration */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900">
            <CardTitle className="text-white">Configuration des seuils de Complexité</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-1/5">Complexité</TableHead>
                  <TableHead className="w-1/5">Points</TableHead>
                  <TableHead className="w-2/5">Seuil</TableHead>
                  <TableHead className="w-1/5">Nombre de cas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-gray-100">
                  <TableCell className="font-medium">Poids du critère</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                </TableRow>
                {editedConfig.complexityThresholds?.map((threshold) => (
                  <TableRow key={`complexity-${threshold.level}`}>
                    <TableCell className="font-medium">
                      {renderComplexityLevels(threshold.level)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={threshold.points}
                        onChange={(e) => handleThresholdChange(false, threshold.level, "points", parseInt(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={threshold.threshold}
                        onChange={(e) => handleThresholdChange(false, threshold.level, "threshold", parseInt(e.target.value))}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {threshold.cases || 0}
                    </TableCell>
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
      
      {/* Dialog for displaying and editing detailed level descriptions */}
      <Dialog open={showDescriptionsDialog} onOpenChange={setShowDescriptionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAxis?.name} - Description des niveaux
            </DialogTitle>
            <DialogDescription>
              Vous pouvez modifier les descriptions des 5 niveaux pour ce critère en cliquant sur le texte:
            </DialogDescription>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Niveau</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedAxis && [1, 2, 3, 4, 5].map((level) => (
                <TableRow key={level}>
                  <TableCell className="align-top">
                    {isValueAxis 
                      ? renderValueLevels(level)
                      : renderComplexityLevels(level)
                    }
                  </TableCell>
                  <TableCell>
                    <LevelDescriptionEditor
                      level={level}
                      currentDescription={getLevelDescription(selectedAxis, level)}
                      onSave={handleUpdateLevelDescription}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowDescriptionsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Matrix;
