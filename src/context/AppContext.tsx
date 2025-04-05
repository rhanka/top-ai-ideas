
import React, { createContext, useContext, useState, useEffect } from "react";
import { UseCase, MatrixConfig } from "../types";

// Define the ValueRating and ComplexityRating types that were previously referenced but not imported
type ValueRating = 1 | 2 | 3 | 4 | 5;
type ComplexityRating = 1 | 2 | 3 | 4 | 5;

// Default matrix configuration
const defaultMatrixConfig: MatrixConfig = {
  valueAxes: [
    { name: "Niveau de Sponsorship", weight: 2, description: "Importance du soutien interne" },
    { name: "Impact Satisfaction Client (CSAT/NPS)", weight: 1.5, description: "Amélioration de l'expérience client" },
    { name: "Gains de Productivité (Agents & Opérations)", weight: 1.5, description: "Optimisation des processus" },
    { name: "Amélioration Expérience Agent & Rétention", weight: 1, description: "Qualité de l'environnement de travail" },
    { name: "Conformité & Image Publique", weight: 1, description: "Respect des normes et perception externe" },
  ],
  complexityAxes: [
    { name: "Maturité & Fiabilité Solution IA", weight: 1, description: "Niveau de développement technologique" },
    { name: "Effort d'Implémentation & Intégration", weight: 1.5, description: "Ressources nécessaires" },
    { name: "IA Responsable & Conformité Données", weight: 1.5, description: "Éthique et protection des données" },
    { name: "Disponibilité, Qualité & Accès Données", weight: 1, description: "Accessibilité des données nécessaires" },
    { name: "Gestion du Changement & Impact Métier", weight: 1, description: "Adaptation organisationnelle requise" },
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
