
import React, { createContext, useContext, useState, useEffect } from "react";
import { UseCase, MatrixConfig, LevelDescription } from "../types";

// Define the ValueRating and ComplexityRating types that were previously referenced but not imported
type ValueRating = 1 | 2 | 3 | 4 | 5;
type ComplexityRating = 1 | 2 | 3 | 4 | 5;

// Default matrix configuration with level descriptions
const defaultMatrixConfig: MatrixConfig = {
  valueAxes: [
    { 
      name: "Niveau de Sponsorship", 
      weight: 2, 
      description: "Importance du soutien interne",
      levelDescriptions: [
        { level: 1, description: "Équipe locale / Aucun sponsor clair" },
        { level: 2, description: "Opérationnel / Gestionnaire 1er niveau" },
        { level: 3, description: "Direction Service Client / TI" },
        { level: 4, description: "Direction Principale / VP Service Client" },
        { level: 5, description: "Vice-Présidence Exécutive / Comité Exécutif" }
      ]
    },
    { 
      name: "Impact Satisfaction Client (CSAT/NPS)", 
      weight: 1.5, 
      description: "Amélioration de l'expérience client",
      levelDescriptions: [
        { level: 1, description: "Impact négligeable ou très localisé sur la satisfaction client." },
        { level: 2, description: "Amélioration mineure d'un point de contact peu fréquent ou irritant mineur." },
        { level: 3, description: "Réduction notable des irritants sur motifs courants (ex: facturation simple). Impact mesurable sur le CSAT." },
        { level: 4, description: "Amélioration sensible de l'expérience sur motifs importants (déménagement) OU réduction significative de l'effort client." },
        { level: 5, description: "Amélioration majeure sur motifs critiques (pannes) OU refonte positive d'un parcours client clé. Fort impact potentiel sur CSAT/NPS." }
      ]
    },
    { 
      name: "Gains de Productivité (Agents & Opérations)", 
      weight: 1.5, 
      description: "Optimisation des processus",
      levelDescriptions: [
        { level: 1, description: "Impact quasi nul sur le TMT (<2%) ou les ETP (<0.5)." },
        { level: 2, description: "Réduction mineure du TMT (2-5%) ou RPC, économie 0.5-1 ETP." },
        { level: 3, description: "Réduction significative du TMT (5-10%), amélioration du RPC, économie 1-3 ETP." },
        { level: 4, description: "Réduction importante du TMT (10-15%), automatisation partielle d'une tâche, économie 3-5 ETP." },
        { level: 5, description: "Réduction majeure du TMT (>15%) ou RPC, forte automatisation/déviation vers self-service, économie > 5 ETP." }
      ]
    },
    { 
      name: "Amélioration Expérience Agent & Rétention", 
      weight: 1, 
      description: "Qualité de l'environnement de travail",
      levelDescriptions: [
        { level: 1, description: "Pas d'impact notable sur le travail de l'agent." },
        { level: 2, description: "Simplifie une tâche très spécifique ou rarement frustrante." },
        { level: 3, description: "Simplifie des tâches modérément complexes, réduit le stress sur certains types d'appels, aide à la formation initiale." },
        { level: 4, description: "Automatise une partie des tâches répétitives, fournit une assistance contextuelle utile." },
        { level: 5, description: "Automatise tâches frustrantes, assistance temps réel précieuse, réduit la charge cognitive, améliore satisfaction agent." }
      ]
    },
    { 
      name: "Conformité & Image Publique", 
      weight: 1, 
      description: "Respect des normes et perception externe",
      levelDescriptions: [
        { level: 1, description: "N/A ou impact neutre." },
        { level: 2, description: "Aide marginale à la conformité (ex: logging simple)." },
        { level: 3, description: "Aide à maintenir la conformité OU améliore l'image sur un aspect spécifique (ex: transparence facturation)." },
        { level: 4, description: "Renforce la conformité sur un point précis OU améliore l'image sur un sujet sensible." },
        { level: 5, description: "Renforce significativement la conformité (traçabilité, données) OU améliore l'image publique sur des enjeux clés (pannes)." }
      ]
    },
  ],
  complexityAxes: [
    { 
      name: "Maturité & Fiabilité Solution IA", 
      weight: 1, 
      description: "Niveau de développement technologique",
      levelDescriptions: [
        { level: 1, description: "Technologie éprouvée et stable pour l'usage (SVI basique)." },
        { level: 2, description: "Technologie éprouvée mais requiert configuration standard (classification simple, chatbot FAQ)." },
        { level: 3, description: "Technologie maîtrisée mais nécessite adaptation/paramétrage fin (chatbot transactionnel). Fiabilité à valider." },
        { level: 4, description: "Technologie récente ou appliquée de manière nouvelle, nécessite PoC/validation poussée. Fiabilité modérée attendue." },
        { level: 5, description: "Technologie émergente/expérimentale ou R&D importante. Fiabilité incertaine." }
      ]
    },
    { 
      name: "Effort d'Implémentation & Intégration", 
      weight: 1.5, 
      description: "Ressources nécessaires",
      levelDescriptions: [
        { level: 1, description: "Solution quasi \"sur étagère\", intégration minimale via API très simples." },
        { level: 2, description: "Intégration légère avec 1-2 systèmes via API standard. Configuration simple." },
        { level: 3, description: "Intégration avec systèmes clés (CRM, téléphonie) via API existantes. Dev/config modéré." },
        { level: 4, description: "Intégration plus complexe avec plusieurs systèmes (certains moins modernes), création d'API simples, orchestration basique." },
        { level: 5, description: "Intégration profonde avec multiples systèmes. Dev custom important, création/modif API complexes, orchestration avancée." }
      ]
    },
    { 
      name: "IA Responsable & Conformité Données", 
      weight: 1.5, 
      description: "Éthique et protection des données",
      levelDescriptions: [
        { level: 1, description: "Pas ou peu de DP, risque biais faible, pas d'enjeux éthiques majeurs." },
        { level: 2, description: "Utilisation de DP non sensibles, risque biais faible mais à vérifier, besoin de documentation conformité simple (Loi 25)." },
        { level: 3, description: "Utilisation de DP (Loi 25), pseudonymisation/anonymisation, gestion consentement, tests biais standards, xAI simple." },
        { level: 4, description: "Utilisation de DP potentiellement sensibles, risque biais modéré nécessitant mitigation active, enjeu C-27/AI Act naissant, transparence accrue." },
        { level: 5, description: "Utilisation DP sensibles, risque biais élevé, enjeux éthiques importants (décisions importantes), conformité C-27/AI Act stricte, audits complexes, xAI avancées." }
      ]
    },
    { 
      name: "Disponibilité, Qualité & Accès Données", 
      weight: 1, 
      description: "Accessibilité des données nécessaires",
      levelDescriptions: [
        { level: 1, description: "Données centralisées, propres, documentées." },
        { level: 2, description: "Données dans 1-2 systèmes, qualité bonne, accès simple, léger nettoyage." },
        { level: 3, description: "Données dans quelques systèmes (<5), nettoyage/rapprochement modéré, qualité acceptable, accès gérable." },
        { level: 4, description: "Données dans plusieurs systèmes, qualité hétérogène, effort ETL notable, complexité d'accès moyenne." },
        { level: 5, description: "Données dispersées (>5 systèmes, legacy), faible qualité, gros efforts ETL/qualité, complexité d'accès (sécurité, silos), besoin datamart/lac." }
      ]
    },
    { 
      name: "Gestion du Changement & Impact Métier", 
      weight: 1, 
      description: "Adaptation organisationnelle requise",
      levelDescriptions: [
        { level: 1, description: "Impact minimal sur processus agents, formation rapide/intuitive." },
        { level: 2, description: "Léger ajustement processus, formation courte nécessaire." },
        { level: 3, description: "Modification notable processus/outils, formation structurée, communication nécessaire." },
        { level: 4, description: "Changement important processus, formation approfondie, accompagnement soutenu requis." },
        { level: 5, description: "Refonte majeure processus, fort impact rôle agent, formation + accompagnement intensifs, plan GOC robuste, implication syndicats (si applicable)." }
      ]
    },
  ],
};

// Calculate scores for a use case
const calcInitialScore = (useCase: UseCase, config: MatrixConfig) => {
  let totalValue = 0;
  let totalComplexity = 0;
  
  useCase.valueScores.forEach(score => {
    const axis = config.valueAxes.find(a => a.name === score.axisId);
    if (axis) {
      totalValue += score.rating * axis.weight;
    }
  });
  
  useCase.complexityScores.forEach(score => {
    const axis = config.complexityAxes.find(a => a.name === score.axisId);
    if (axis) {
      totalComplexity += score.rating * axis.weight;
    }
  });
  
  return {
    ...useCase,
    totalValueScore: totalValue,
    totalComplexityScore: totalComplexity
  };
};

// Provide example use case for demonstration
const exampleUseCase: UseCase = {
  id: "ID01",
  name: "Chatbot FAQ & Triage (Web & Mobile)",
  domain: "Web",
  description: "Mise en place d'un agent conversationnel (chatbot) sur le site web et l'application mobile, capable de comprendre le langage naturel pour répondre aux questions les plus fréquentes des clients (ex: horaires, suivi de commande, tarifs de base) et de les guider vers des ressources en libre-service (FAQ détaillée, espace client) ou de les transférer vers le canal de contact approprié (chat avec agent humain, appel téléphonique) si nécessaire.",
  technology: "GenAI Texte",
  deadline: "2026-Q1",
  contact: "",
  benefits: [
    "Réduction appels N1",
    "Dispo 24/7",
    "Amélioration Self-service",
    "Baisse coûts"
  ],
  metrics: [
    "Taux résolution auto",
    "CSAT bot",
    "Baisse volume appels FAQ"
  ],
  risks: [
    "Mauvaise compréhension",
    "Frustration client",
    "Triage incorrect",
    "Maintenance KB"
  ],
  nextSteps: [
    "Identifier TOP FAQs",
    "Rédiger réponses claires",
    "Choisir plateforme",
    "Définir règles de triage"
  ],
  sources: [
    "Base de connaissances (KB)",
    "Web/App Logs",
    "(CRM)"
  ],
  valueScores: [
    { axisId: "Niveau de Sponsorship", rating: 1, description: "Équipe locale / Aucun sponsor clair" },
    { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 4, description: "Amélioration sensible de l'expérience sur motifs importants (déménagement) OU réduction significative de l'effort client." },
    { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Réduction importante du TMT (10-15%), automatisation partielle d'une tâche, économie 3-5 ETP." },
    { axisId: "Amélioration Expérience Agent & Rétention", rating: 2, description: "Simplifie des tâches modérément complexes, réduit le stress sur certains types d'appels, aide à la formation initiale." },
    { axisId: "Conformité & Image Publique", rating: 2, description: "Aide à maintenir la conformité OU améliore l'image sur un aspect spécifique (ex: transparence facturation)." },
  ],
  complexityScores: [
    { axisId: "Maturité & Fiabilité Solution IA", rating: 3, description: "Technologie maîtrisée mais nécessite adaptation/paramétrage fin (chatbot transactionnel). Fiabilité à valider." },
    { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Intégration avec systèmes clés (CRM, téléphonie) via API existantes. Dev/config modéré." },
    { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de DP (Loi 25), pseudonymisation/anonymisation, gestion consentement, tests biais standards, ×AI simple." },
    { axisId: "Disponibilité, Qualité & Accès Données", rating: 3, description: "Données dans quelques systèmes (<5), nettoyage/approchement modéré, qualité acceptable, accès gérable." },
    { axisId: "Gestion du Changement & Impact Métier", rating: 2, description: "Léger ajustement processus, formation courte nécessaire." },
  ],
  totalValueScore: 0,
  totalComplexityScore: 0,
};

// Initialize with calculated scores and create initial use cases
const initialCalculatedExample = calcInitialScore(exampleUseCase, defaultMatrixConfig);
const initialUseCases = [initialCalculatedExample];

// Context type
type AppContextType = {
  useCases: UseCase[];
  matrixConfig: MatrixConfig;
  activeUseCase: UseCase | null;
  currentInput: string;
  addUseCase: (useCase: UseCase) => void;
  updateUseCase: (useCase: UseCase) => void;
  deleteUseCase: (id: string) => void;
  setActiveUseCase: (useCase: UseCase | null) => void;
  updateMatrixConfig: (config: MatrixConfig) => void;
  setCurrentInput: (input: string) => void;
  generateUseCases: () => void;
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Move useState hooks to the top level of the function component
  const [useCases, setUseCases] = useState<UseCase[]>(initialUseCases);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(defaultMatrixConfig);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  const [currentInput, setCurrentInput] = useState<string>("");
  
  // Add new use case
  const addUseCase = (useCase: UseCase) => {
    const newUseCase = calcInitialScore(useCase, matrixConfig);
    setUseCases([...useCases, newUseCase]);
  };
  
  // Update existing use case
  const updateUseCase = (updatedUseCase: UseCase) => {
    const updated = calcInitialScore(updatedUseCase, matrixConfig);
    setUseCases(useCases.map(useCase => 
      useCase.id === updated.id ? updated : useCase
    ));
    
    if (activeUseCase?.id === updated.id) {
      setActiveUseCase(updated);
    }
  };
  
  // Delete use case
  const deleteUseCase = (id: string) => {
    setUseCases(useCases.filter(useCase => useCase.id !== id));
    if (activeUseCase?.id === id) {
      setActiveUseCase(null);
    }
  };
  
  // Update matrix configuration
  const updateMatrixConfig = (config: MatrixConfig) => {
    setMatrixConfig(config);
    
    // Recalculate all use case scores with new configuration
    const updatedUseCases = useCases.map(useCase => calcInitialScore(useCase, config));
    setUseCases(updatedUseCases);
    
    // Update active use case if any
    if (activeUseCase) {
      const updatedActive = updatedUseCases.find(u => u.id === activeUseCase.id);
      if (updatedActive) {
        setActiveUseCase(updatedActive);
      }
    }
  };
  
  // Generate new use cases based on user input
  const generateUseCases = () => {
    // For demonstration, we'll create a mock use case
    // In a real application, this would call an API to generate use cases
    if (currentInput.trim().length > 0) {
      const newId = `ID${(useCases.length + 1).toString().padStart(2, '0')}`;
      
      const newUseCase: UseCase = {
        id: newId,
        name: `Cas d'usage généré ${useCases.length + 1}`,
        domain: "Généré",
        description: `Use case généré basé sur: ${currentInput.substring(0, 100)}...`,
        technology: "IA Générative",
        deadline: "À déterminer",
        contact: "",
        benefits: ["À définir"],
        metrics: ["À définir"],
        risks: ["À identifier"],
        nextSteps: ["Analyser en détail"],
        sources: ["Génération IA"],
        valueScores: matrixConfig.valueAxes.map(axis => ({
          axisId: axis.name,
          rating: 3 as ValueRating,
          description: "À évaluer"
        })),
        complexityScores: matrixConfig.complexityAxes.map(axis => ({
          axisId: axis.name,
          rating: 3 as ComplexityRating,
          description: "À évaluer"
        })),
      };
      
      addUseCase(newUseCase);
      setCurrentInput("");
    }
  };
  
  const value = {
    useCases,
    matrixConfig,
    activeUseCase,
    currentInput,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    setActiveUseCase,
    updateMatrixConfig,
    setCurrentInput,
    generateUseCases
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Export the context directly
export { AppContext };
