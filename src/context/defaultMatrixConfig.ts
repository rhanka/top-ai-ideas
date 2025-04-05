
import { MatrixConfig, LevelThreshold, LevelDescription } from "../types";

// Default value thresholds
export const defaultValueThresholds: LevelThreshold[] = [
  { level: 1, min: 0, max: 40, points: 0, threshold: 300, cases: 0 },
  { level: 2, min: 41, max: 100, points: 40, threshold: 700, cases: 0 },
  { level: 3, min: 101, max: 400, points: 100, threshold: 1000, cases: 0 },
  { level: 4, min: 401, max: 2000, points: 400, threshold: 1500, cases: 0 },
  { level: 5, min: 2001, max: Infinity, points: 2000, threshold: 4000, cases: 0 }
];

// Default complexity thresholds
export const defaultComplexityThresholds: LevelThreshold[] = [
  { level: 1, min: 0, max: 50, points: 0, threshold: 100, cases: 0 },
  { level: 2, min: 51, max: 100, points: 50, threshold: 250, cases: 0 },
  { level: 3, min: 101, max: 250, points: 100, threshold: 500, cases: 0 },
  { level: 4, min: 251, max: 1000, points: 250, threshold: 1000, cases: 0 },
  { level: 5, min: 1001, max: Infinity, points: 1000, threshold: 2000, cases: 0 }
];

// Default matrix configuration with level descriptions
export const defaultMatrixConfig: MatrixConfig = {
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
  valueThresholds: defaultValueThresholds,
  complexityThresholds: defaultComplexityThresholds
};
