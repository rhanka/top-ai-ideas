import React, { createContext, useContext, useState, useEffect } from "react";
import { UseCase, MatrixConfig, LevelDescription, LevelThreshold } from "../types";
import { toast } from "sonner";
import { OpenAIService } from "../services/OpenAIService";

// Constants
const OPENAI_API_KEY = "openai_api_key";
const USE_CASE_LIST_PROMPT = "use_case_list_prompt";
const USE_CASE_DETAIL_PROMPT = "use_case_detail_prompt";

// Default prompts with placeholders
const DEFAULT_USE_CASE_LIST_PROMPT = 
`Génère une liste de 5 cas d'usage d'IA innovants pour le domaine suivant: {{user_input}}.
Pour chaque cas d'usage, propose un titre court et explicite.
Format: liste numérotée sans description.`;

const DEFAULT_USE_CASE_DETAIL_PROMPT = 
`Génère un cas d'usage détaillé pour "{{use_case}}" dans le contexte suivant: {{user_input}}. Utilise la matrice valeur/complexité fournie: {{matrix}} pour évaluer chaque axe de valeur et complexité.

La réponse doit impérativement contenir tous les éléments suivants au format JSON:

{
  "name": "{{use_case}}",
  "description": "Description détaillée du cas d'usage sur 5-10 lignes",
  "domain": "Le domaine d'application principal",
  "technology": "Technologies d'IA à utiliser (NLP, Computer Vision, etc.)",
  "deadline": "Estimation du délai de mise en œuvre (ex: Q3 2025)",
  "contact": "Nom du responsable suggéré",
  "benefits": [
    "Bénéfice 1",
    "Bénéfice 2",
    "Bénéfice 3",
    "Bénéfice 4",
    "Bénéfice 5"
  ],
  "metrics": [
    "KPI ou mesure de succès 1",
    "KPI ou mesure de succès 2",
    "KPI ou mesure de succès 3"
  ],
  "risks": [
    "Risque 1",
    "Risque 2",
    "Risque 3"
  ],
  "nextSteps": [
    "Étape 1",
    "Étape 2",
    "Étape 3",
    "Étape 4"
  ],
  "sources": [
    "Source de données 1",
    "Source de données 2"
  ],
  "relatedData": [
    "Donnée associée 1",
    "Donnée associée 2",
    "Donnée associée 3"
  ],
  "valueScores": [
    {
      "axisId": "Nom du 1er axe de valeur",
      "rating": 4,
      "description": "Justification du score"
    },
    {
      "axisId": "Nom du 2ème axe de valeur",
      "rating": 3,
      "description": "Justification du score"
    }
    // Complète pour les autres axes de valeur présents dans la matrice
  ],
  "complexityScores": [
    {
      "axisId": "Nom du 1er axe de complexité",
      "rating": 2,
      "description": "Justification du score"
    },
    {
      "axisId": "Nom du 2ème axe de complexité",
      "rating": 4,
      "description": "Justification du score"
    }
    // Complète pour les autres axes de complexité présents dans la matrice
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans texte avant ou après. Veille à ce que chaque axe de la matrice fournie ait bien son score correspondant dans les sections valueScores et complexityScores.`;

// Define the ValueRating and ComplexityRating types that were previously referenced but not imported
type ValueRating = 1 | 2 | 3 | 4 | 5;
type ComplexityRating = 1 | 2 | 3 | 4 | 5;

// Default value thresholds
const defaultValueThresholds: LevelThreshold[] = [
  { level: 1, min: 0, max: 40, points: 0, threshold: 300, cases: 0 },
  { level: 2, min: 41, max: 100, points: 40, threshold: 700, cases: 0 },
  { level: 3, min: 101, max: 400, points: 100, threshold: 1000, cases: 0 },
  { level: 4, min: 401, max: 2000, points: 400, threshold: 1500, cases: 0 },
  { level: 5, min: 2001, max: Infinity, points: 2000, threshold: 4000, cases: 0 }
];

// Default complexity thresholds
const defaultComplexityThresholds: LevelThreshold[] = [
  { level: 1, min: 0, max: 50, points: 0, threshold: 100, cases: 0 },
  { level: 2, min: 51, max: 100, points: 50, threshold: 250, cases: 0 },
  { level: 3, min: 101, max: 250, points: 100, threshold: 500, cases: 0 },
  { level: 4, min: 251, max: 1000, points: 250, threshold: 1000, cases: 0 },
  { level: 5, min: 1001, max: Infinity, points: 1000, threshold: 2000, cases: 0 }
];

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
  valueThresholds: defaultValueThresholds,
  complexityThresholds: defaultComplexityThresholds
};

// Calculate scores for a use case
const calcInitialScore = (useCase: UseCase, config: MatrixConfig) => {
  let totalValue = 0;
  let totalComplexity = 0;
  
  // Calculate value score based on rating points * axis weight
  useCase.valueScores.forEach(score => {
    const axis = config.valueAxes.find(a => a.name === score.axisId);
    if (axis) {
      // Map rating to points based on thresholds
      let points = 0;
      if (config.valueThresholds) {
        const threshold = config.valueThresholds.find(t => t.level === score.rating);
        points = threshold ? threshold.points : 0;
      }
      totalValue += points * axis.weight;
    }
  });
  
  // Calculate complexity score based on rating points * axis weight
  useCase.complexityScores.forEach(score => {
    const axis = config.complexityAxes.find(a => a.name === score.axisId);
    if (axis) {
      // Map rating to points based on thresholds
      let points = 0;
      if (config.complexityThresholds) {
        const threshold = config.complexityThresholds.find(t => t.level === score.rating);
        points = threshold ? threshold.points : 0;
      }
      totalComplexity += points * axis.weight;
    }
  });
  
  return {
    ...useCase,
    totalValueScore: totalValue,
    totalComplexityScore: totalComplexity
  };
};

// Création des nouveaux cas d'usage basés sur l'image
const newUseCases: UseCase[] = [
  // Cas d'usage 1: Chatbot FAQ & Triage (Web & Mobile)
  {
    id: "UC001",
    name: "Chatbot FAQ & Triage (Web & Mobile)",
    domain: "Service Client",
    description: "Mise en place d'un agent conversationnel (chatbot) sur le site web et l'application mobile, capable de comprendre le langage naturel pour répondre aux questions les plus fréquentes des clients (ex: horaires, suivi de commande, tarifs de base) et de les guider vers des ressources en libre-service (FAQ détaillée, espace client) ou de les transférer vers le canal de contact approprié (chat avec agent humain, appel téléphonique) si nécessaire.",
    technology: "NLP, Machine Learning, Traitement du langage naturel",
    deadline: "2026-Q1",
    contact: "Sophie Martin",
    benefits: [
      "Réduction du volume d'appels de premier niveau",
      "Disponibilité 24/7 du service client",
      "Amélioration de l'expérience self-service",
      "Réduction des coûts opérationnels",
      "Uniformisation des réponses aux questions fréquentes"
    ],
    metrics: [
      "Taux de résolution automatique (% requêtes résolues sans intervention humaine)",
      "Taux de satisfaction client (CSAT) post-interaction chatbot",
      "Taux de déflection des appels entrants (%)",
      "Précision des réponses fournies"
    ],
    risks: [
      "Mauvaise compréhension des questions complexes",
      "Frustration client en cas de réponses inappropriées",
      "Triage incorrect vers le mauvais canal",
      "Maintenance continue de la base de connaissances requise",
      "Difficulté à gérer les dialectes régionaux ou expressions idiomatiques"
    ],
    nextSteps: [
      "Identifier le TOP 100 des questions fréquentes",
      "Sélectionner la plateforme technologique",
      "Constituer la base de connaissances initiale",
      "Définir les règles de triage et d'escalade",
      "Planifier la phase de test avec un groupe restreint d'utilisateurs"
    ],
    sources: [
      "Base de connaissances existante",
      "Logs de conversations web/mobile",
      "Historique des interactions CRM",
      "Transcriptions d'appels"
    ],
    relatedData: [
      "Identité client",
      "Historique des commandes",
      "Statut des services",
      "FAQ existante"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 3, description: "Direction Service Client / TI" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 4, description: "Amélioration sensible de l'expérience sur motifs importants (suivi de commande) et réduction significative de l'effort client." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Réduction importante du TMT (10-15%), automatisation partielle des réponses aux questions fréquentes, économie estimée à 3-5 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 3, description: "Simplifie des tâches modérément complexes, réduit le stress sur les appels basiques, aide à la formation initiale." },
      { axisId: "Conformité & Image Publique", rating: 3, description: "Aide à maintenir la conformité avec traçabilité des interactions et améliore l'image sur l'aspect disponibilité du service client." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 2, description: "Technologie éprouvée mais requiert configuration standard (chatbot FAQ)." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Intégration avec systèmes clés (CRM, site web, application mobile) via API existantes. Développement et configuration modérés." },
      { axisId: "IA Responsable & Conformité Données", rating: 2, description: "Utilisation de données personnelles non sensibles, risque de biais faible mais à vérifier, documentation de conformité simple (Loi 25)." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 2, description: "Données dans 1-2 systèmes, qualité bonne, accès simple, léger nettoyage nécessaire pour la base de connaissances." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 2, description: "Léger ajustement des processus, formation courte nécessaire pour les agents sur le nouveau canal de triage." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 2: Authentification Client Automatisée (Voix/SVI)
  {
    id: "UC002",
    name: "Authentification Client Automatisée (Voix/SVI)",
    domain: "Sécurité & Authentification",
    description: "Utilisation d'un Système Vocal Interactif (SVI) avancé pour authentifier les clients lors d'un appel. Cela peut se faire soit par biométrie vocale (analyse de l'empreinte vocale unique du client après enrôlement préalable) soit via un dialogue conversationnel sécurisé où le SVI pose des questions de sécurité dynamiques basées sur les informations client connues.",
    technology: "Reconnaissance vocale, Biométrie vocale, NLP",
    deadline: "2026-Q2",
    contact: "Alexandre Dupont",
    benefits: [
      "Réduction du temps d'authentification (30-60 secondes gagnées par appel)",
      "Amélioration de la sécurité et réduction des fraudes",
      "Expérience client plus fluide sans répétition d'information",
      "Standardisation du processus d'authentification",
      "Conformité renforcée avec les réglementations d'authentification"
    ],
    metrics: [
      "Taux de succès d'authentification au premier essai",
      "Temps moyen d'authentification",
      "Réduction des tentatives de fraude détectées",
      "Satisfaction client sur le processus d'authentification"
    ],
    risks: [
      "Faux positifs/négatifs dans la reconnaissance vocale",
      "Résistance des clients à l'enrôlement biométrique",
      "Problèmes d'accessibilité pour certains clients",
      "Conformité aux réglementations sur les données biométriques",
      "Coût élevé de la solution biométrique"
    ],
    nextSteps: [
      "Étude comparative des technologies de biométrie vocale",
      "Définition des scénarios d'authentification privilégiés",
      "Consultation juridique sur la conformité réglementaire",
      "Planification de la stratégie d'enrôlement client",
      "Proof of Concept avec un échantillon de clients volontaires"
    ],
    sources: [
      "Base de données client",
      "Historique d'authentification",
      "Enregistrements vocaux (pour enrôlement)",
      "Logs de tentatives d'authentification"
    ],
    relatedData: [
      "Données d'identité client",
      "Empreintes vocales (données biométriques)",
      "Historique des transactions",
      "Questions de sécurité personnalisées"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 4, description: "Direction Principale / VP Service Client, avec fort soutien de la sécurité informatique" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Réduction notable des irritants sur le processus d'authentification (motif courant). Impact mesurable sur le CSAT." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 5, description: "Réduction majeure du TMT (>15%) sur tous les appels nécessitant une authentification, forte automatisation du processus, économie >5 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 4, description: "Automatise une partie des tâches répétitives (vérification d'identité), fournit une assistance contextuelle utile." },
      { axisId: "Conformité & Image Publique", rating: 5, description: "Renforce significativement la conformité (traçabilité, sécurité des données) et améliore l'image publique sur la protection des comptes clients." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 3, description: "Technologie maîtrisée mais nécessite adaptation/paramétrage fin pour la reconnaissance vocale biométrique. Fiabilité à valider." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 4, description: "Intégration plus complexe avec plusieurs systèmes (CRM, téléphonie, système d'authentification), création d'API pour le stockage sécurisé des empreintes vocales." },
      { axisId: "IA Responsable & Conformité Données", rating: 5, description: "Utilisation de données personnelles sensibles (biométriques), risque de biais élevé, enjeux éthiques importants (accès aux comptes), conformité stricte exigée." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 3, description: "Données dans quelques systèmes (<5), qualité acceptable mais nécessitant une vérification, accès gérable mais sécurisé." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification notable des processus d'authentification, formation structurée pour les agents, communication importante auprès des clients." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 3: Traitement Automatisé Requêtes Simples (Self-Service IVR/Web)
  {
    id: "UC003",
    name: "Traitement Automatisé Requêtes Simples (Self-Service IVR/Web)",
    domain: "Automatisation des processus",
    description: "Développement de parcours entièrement automatisés, accessibles via le SVI téléphonique ou l'espace client web/mobile, permettant aux clients d'effectuer des actions simples sans intervention humaine. Exemples : déclarer un déménagement, renouvellement d'abonnement, négocier une entente de paiement simple selon des règles prédéfinies, soumettre un relevé de compteur.",
    technology: "NLP, Reconnaissance vocale, RPA, Orchestration de processus",
    deadline: "2026-Q3",
    contact: "Marie Lefebvre",
    benefits: [
      "Réduction significative des appels pour motifs simples",
      "Disponibilité 24/7 des services courants",
      "Libération des agents pour les cas complexes",
      "Traitement plus rapide des demandes courantes",
      "Uniformisation et fiabilité des processus"
    ],
    metrics: [
      "Taux d'utilisation des parcours automatisés",
      "Taux de complétion des parcours sans assistance",
      "Économies réalisées (ETP)",
      "Satisfaction client sur les parcours automatisés"
    ],
    risks: [
      "Complexification imprévue de certains cas apparemment simples",
      "Résistance au changement de certains segments clients",
      "Défaillances techniques impactant l'expérience client",
      "Actualisation constante nécessaire des règles métier",
      "Difficulté à couvrir tous les cas particuliers"
    ],
    nextSteps: [
      "Identifier et prioriser les requêtes à automatiser",
      "Cartographier les processus existants",
      "Définir les règles métier pour chaque parcours",
      "Développer des prototypes pour les cas prioritaires",
      "Planifier le déploiement progressif par canaux"
    ],
    sources: [
      "Base de données clients",
      "Système de facturation",
      "Système CRM",
      "Cartographie des processus existants",
      "Historique des demandes clients"
    ],
    relatedData: [
      "Données d'adresses et de localisation",
      "Informations de facturation",
      "Détails des contrats et services",
      "Historique des demandes précédentes",
      "Données de consommation"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 4, description: "Direction Principale / VP Service Client avec soutien des opérations" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 4, description: "Amélioration sensible de l'expérience sur motifs importants (déménagement) et réduction significative de l'effort client pour des démarches courantes." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 5, description: "Réduction majeure du TMT (>15%) et forte automatisation/déviation vers self-service, économie estimée > 8 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 3, description: "Simplifie des tâches modérément complexes en les automatisant, réduit le stress lié aux demandes répétitives." },
      { axisId: "Conformité & Image Publique", rating: 3, description: "Aide à maintenir la conformité avec traçabilité des demandes et améliore l'image sur l'efficacité du service client." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 3, description: "Technologie maîtrisée mais nécessite adaptation pour les parcours transactionnels. Fiabilité à valider par cas d'usage." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 4, description: "Intégration plus complexe avec plusieurs systèmes (CRM, facturation, téléphonie), création d'API pour les workflows, orchestration de processus." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de données personnelles (adresses, informations de contrat), tests de biais standards, maintien de traces pour auditabilité." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 4, description: "Données dans plusieurs systèmes, qualité hétérogène selon les sources, effort ETL notable pour harmoniser les données clients." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 4, description: "Changement important des processus, formation approfondie nécessaire, accompagnement soutenu des agents vers un rôle plus consultatif." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 4: Synthèse Contexte Client 360° pour Agent
  {
    id: "UC004",
    name: "Synthèse Contexte Client 360° pour Agent",
    domain: "Support Agent",
    description: "Affichage dynamique sur l'écran de l'agent d'un résumé pertinent et instantané des informations clés du client qui appelle. Ce résumé agrège des données provenant de diverses sources (CRM, facturation, historique des interactions, état des services/pannes) pour donner à l'agent une vue complète et rapide de la situation du client.",
    technology: "Intégration de données, IA prédictive, Visualisation de données",
    deadline: "2025-Q4",
    contact: "Thomas Bernard",
    benefits: [
      "Réduction du temps de traitement des appels",
      "Amélioration de l'expérience client (pas de répétition d'information)",
      "Résolution plus rapide des problèmes",
      "Amélioration de la pertinence des réponses agent",
      "Possibilité d'offres contextuelles personnalisées"
    ],
    metrics: [
      "Temps moyen de traitement (TMT) des appels",
      "Score de satisfaction agent sur l'outil",
      "Taux de résolution au premier contact",
      "Réduction des transferts entre services"
    ],
    risks: [
      "Surcharge d'informations pour l'agent",
      "Problèmes d'intégration des données disparates",
      "Latence possible dans l'affichage des informations",
      "Qualité variable des données historiques",
      "Formation nécessaire pour utilisation optimale"
    ],
    nextSteps: [
      "Cartographier les sources de données pertinentes",
      "Définir le modèle d'information prioritaire par type d'appel",
      "Concevoir l'interface utilisateur avec des agents",
      "Mettre en place l'architecture d'intégration de données",
      "Déployer un pilote avec un groupe restreint d'agents"
    ],
    sources: [
      "Système CRM",
      "Système de facturation",
      "Système de gestion des incidents",
      "Historique des interactions client",
      "Base de données produits et services"
    ],
    relatedData: [
      "Profil client complet",
      "Historique des interactions récentes",
      "Statut des services et équipements",
      "Informations de facturation et paiement",
      "Historique des problèmes techniques"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 3, description: "Direction Service Client / TI avec support des responsables d'équipes" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Réduction notable des irritants liés à la répétition d'information. Impact mesurable sur le CSAT." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Réduction importante du TMT (10-15%) grâce à l'accès immédiat aux informations pertinentes, économie estimée à 3-4 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 5, description: "Réduction majeure de la charge cognitive, assistance temps réel précieuse, amélioration significative de la satisfaction agent." },
      { axisId: "Conformité & Image Publique",
