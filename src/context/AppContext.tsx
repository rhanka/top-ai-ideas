
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
      { axisId: "Conformité & Image Publique", rating: 2, description: "Aide marginale à la conformité via une meilleure connaissance client." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 2, description: "Technologie d'intégration éprouvée avec éléments prédictifs standards nécessitant une configuration adaptée." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 5, description: "Intégration profonde avec multiples systèmes souvent disparates, création d'API complexes, orchestration avancée des flux de données." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de nombreuses données personnelles, nécessité d'anonymisation pour certains tests, vérification des accès appropriés." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 5, description: "Données dispersées entre de nombreux systèmes, certains legacy, qualité variable, efforts ETL importants, complexité d'accès élevée." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification notable des habitudes de travail des agents, formation structurée nécessaire, communication importante." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 5: Transcription Temps Réel & Résumé d'Appel Post-Interaction
  {
    id: "UC005",
    name: "Transcription Temps Réel & Résumé d'Appel Post-Interaction",
    domain: "Productivité Agent",
    description: "Conversion automatique de la conversation téléphonique en texte pendant l'appel (transcription live). Après la fin de l'appel, génération automatique d'un résumé concis et pertinent de l'interaction, qui est ensuite enregistré dans le CRM, évitant à l'agent une saisie manuelle longue et potentiellement incomplète.",
    technology: "Speech-to-text, NLP, Génération de texte, Résumé automatique",
    deadline: "2025-Q4",
    contact: "Émilie Rousseau",
    benefits: [
      "Réduction du temps de documentation post-appel",
      "Amélioration de la qualité et cohérence des notes CRM",
      "Possibilité d'analyse des conversations à grande échelle",
      "Traçabilité complète des échanges avec le client",
      "Support à la formation des nouveaux agents"
    ],
    metrics: [
      "Temps économisé sur la documentation (minutes/appel)",
      "Précision des transcriptions et résumés",
      "Taux d'adoption par les agents",
      "Complétude des informations capturées vs saisie manuelle"
    ],
    risks: [
      "Précision insuffisante des transcriptions (accents, bruit)",
      "Résumés manquant des informations critiques",
      "Problèmes de confidentialité liés à l'enregistrement",
      "Résistance des agents habitués à leurs propres méthodes",
      "Défis techniques d'intégration au CRM"
    ],
    nextSteps: [
      "Évaluer les technologies de transcription adaptées au contexte métier",
      "Définir le format et contenu attendu des résumés",
      "Établir le processus de validation/correction par l'agent",
      "Réaliser des tests de précision avec différents accents/contextes",
      "Former les agents à la validation des résumés automatiques"
    ],
    sources: [
      "Enregistrements d'appels",
      "Système téléphonique",
      "CRM",
      "Bases de connaissances métier",
      "Notes d'appels existantes"
    ],
    relatedData: [
      "Transcriptions d'appels",
      "Métadonnées d'appels (durée, transferts)",
      "Actions post-appel",
      "Catégorisation des motifs d'appel",
      "Identité client et contexte"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 3, description: "Direction Service Client / TI avec intérêt particulier des superviseurs d'équipes" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 2, description: "Amélioration mineure indirecte via une meilleure continuité dans les interactions futures grâce aux notes précises." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 5, description: "Réduction majeure du temps de documentation post-appel (>15% du TMT total), économie >5 ETP sur l'ensemble des équipes." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 4, description: "Automatisation d'une tâche répétitive et souvent frustrante (documentation), assistance contextuelle très appréciée." },
      { axisId: "Conformité & Image Publique", rating: 4, description: "Renforce significativement la conformité avec une traçabilité complète des échanges et engagements pris." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 4, description: "Technologie de transcription en temps réel encore imparfaite dans les environnements bruités, nécessite validation poussée et ajustements." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Intégration avec les systèmes de téléphonie et CRM via API existantes, configuration modérée des modèles de résumé." },
      { axisId: "IA Responsable & Conformité Données", rating: 4, description: "Utilisation de données conversationnelles potentiellement sensibles, nécessité d'une bonne gestion du consentement et d'anonymisation." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 3, description: "Données audio dans quelques systèmes, qualité variable selon l'environnement d'appel, accès gérable mais nécessitant des processus spécifiques." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification des processus de documentation, formation structurée nécessaire, adaptation des habitudes de travail." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 6: Analyse Qualité & Sentiment Appel
  {
    id: "UC006",
    name: "Analyse Qualité & Sentiment Appel",
    domain: "Qualité Service",
    description: "Analyse automatisée des enregistrements ou transcriptions d'appels pour évaluer la qualité de l'interaction selon une grille prédéfinie. Détection automatique du sentiment global du client (positif, négatif, neutre), identification de mots-clés spécifiques (irritants, motifs de satisfaction, termes liés à la conformité) et attribution d'un score de qualité.",
    technology: "NLP, Analyse de sentiment, Classification de texte, Speech analytics",
    deadline: "2026-Q1",
    contact: "Philippe Moreau",
    benefits: [
      "Évaluation objective et systématique de 100% des appels",
      "Identification précoce des problèmes récurrents",
      "Coaching ciblé des agents sur points d'amélioration",
      "Détection des meilleures pratiques à généraliser",
      "Corrélation entre satisfaction client et comportements agents"
    ],
    metrics: [
      "Corrélation entre scores automatiques et évaluations manuelles",
      "Tendances des scores de qualité par agent/équipe",
      "Détection précoce des irritants clients émergents",
      "Amélioration des indicateurs qualité après coaching"
    ],
    risks: [
      "Précision insuffisante de l'analyse de sentiment",
      "Résistance des évaluateurs qualité traditionnels",
      "Interprétation erronée du contexte conversationnel",
      "Sentiment de surveillance excessive par les agents",
      "Difficultés avec les expressions idiomatiques ou ironiques"
    ],
    nextSteps: [
      "Définir la grille d'évaluation automatisée",
      "Entraîner le modèle sur un corpus d'appels évalués manuellement",
      "Valider la corrélation entre évaluations manuelles et automatiques",
      "Développer le tableau de bord d'analyse pour superviseurs",
      "Établir le processus d'amélioration continue du modèle"
    ],
    sources: [
      "Enregistrements d'appels",
      "Transcriptions existantes",
      "Évaluations qualité manuelles historiques",
      "Grilles d'évaluation actuelles",
      "Résultats d'enquêtes satisfaction"
    ],
    relatedData: [
      "Scores de satisfaction client post-appel",
      "Données de performance des agents",
      "Catégorisation des appels",
      "Mots-clés et expressions typiques",
      "Durées d'appel et temps d'attente"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 3, description: "Direction Service Client / TI avec fort soutien des responsables qualité" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Impact indirect mais mesurable sur le CSAT via l'amélioration continue de la qualité des interactions." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Réduction importante des efforts d'évaluation qualité manuelle, coaching plus ciblé, économie estimée à 3-4 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 3, description: "Feedback plus objectif et régulier, coaching personnalisé, potentielle réduction du stress lié aux évaluations subjectives." },
      { axisId: "Conformité & Image Publique", rating: 5, description: "Renforce significativement la conformité via la détection systématique des mentions problématiques et le suivi de scripts obligatoires." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 4, description: "Analyse de sentiment encore imparfaite dans certains contextes nuancés, nécessite validation poussée et ajustements constants." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Intégration avec systèmes d'enregistrement et outils qualité existants, développement modéré pour les tableaux de bord." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de données conversationnelles, nécessité de gérer les biais potentiels, transparence dans l'évaluation automatique." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 2, description: "Données généralement centralisées dans 1-2 systèmes d'enregistrement, qualité audio variable mais gérable." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 4, description: "Changement important dans les processus d'évaluation qualité, réticence possible des évaluateurs traditionnels, besoin d'accompagnement soutenu." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 7: Agent Assist - Suggestions Temps Réel
  {
    id: "UC007",
    name: "Agent Assist - Suggestions Temps Réel",
    domain: "Support Agent",
    description: "Analyse en temps réel de la conversation entre l'agent et le client pour comprendre le contexte et le besoin. Le système suggère alors de manière proactive à l'agent des informations pertinentes : articles de la base de connaissances, étapes de procédure à suivre, réponses types, informations client spécifiques, etc., affichées directement sur son écran.",
    technology: "NLP, Machine Learning, Speech-to-Text, Recherche sémantique",
    deadline: "2026-Q2",
    contact: "Claire Dubois",
    benefits: [
      "Réduction du temps de recherche d'information pendant l'appel",
      "Amélioration de la précision des réponses fournies",
      "Réduction du temps de formation des nouveaux agents",
      "Standardisation des réponses aux questions fréquentes",
      "Support contextuel pour les cas complexes"
    ],
    metrics: [
      "Taux d'utilisation des suggestions proposées",
      "Réduction du temps moyen de traitement",
      "Score de pertinence des suggestions (évalué par agents)",
      "Impact sur le taux de résolution au premier contact"
    ],
    risks: [
      "Suggestions non pertinentes créant une distraction",
      "Surcharge cognitive pour certains agents",
      "Dépendance excessive réduisant l'autonomie",
      "Difficultés techniques de compréhension en temps réel",
      "Résistance au changement des agents expérimentés"
    ],
    nextSteps: [
      "Cartographier les cas d'usage prioritaires pour suggestions",
      "Structurer la base de connaissances pour l'extraction contextuelle",
      "Concevoir l'interface utilisateur non intrusive",
      "Définir les règles de priorisation des suggestions",
      "Former un groupe pilote d'agents"
    ],
    sources: [
      "Base de connaissances",
      "Transcriptions d'appels historiques",
      "Procédures internes",
      "CRM",
      "Feedback des agents sur les difficultés récurrentes"
    ],
    relatedData: [
      "Historique client",
      "Questions fréquemment posées",
      "Produits et services souscrits",
      "Problèmes techniques récurrents",
      "Résolutions précédentes similaires"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 3, description: "Direction Service Client / TI avec soutien modéré des responsables d'équipe" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Réduction notable des délais de réponse et amélioration de la précision des informations. Impact mesurable sur le CSAT." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Réduction importante du TMT (10-15%) grâce à l'accès immédiat aux informations pertinentes, économie estimée à 3-5 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 5, description: "Assistance temps réel précieuse, réduction significative de la charge cognitive, amélioration majeure de la confiance des agents." },
      { axisId: "Conformité & Image Publique", rating: 3, description: "Aide à maintenir la conformité en suggérant les mentions légales appropriées et informations réglementaires." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 4, description: "Technologie récente nécessitant une adaptation importante au contexte métier spécifique, précision à valider en conditions réelles." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 4, description: "Intégration complexe avec systèmes de téléphonie, CRM, base de connaissances, nécessite développement d'interfaces spécifiques." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de données conversationnelles avec besoin de traçabilité des suggestions suivies, transparence nécessaire." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 4, description: "Données réparties entre plusieurs systèmes, qualité variable de la base de connaissances, besoin d'harmonisation important." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification notable des habitudes de travail, formation structurée nécessaire, période d'adaptation à prévoir." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 8: Qualification Appels Urgents (Crise/Panne)
  {
    id: "UC008",
    name: "Qualification Appels Urgents (Crise/Panne)",
    domain: "Gestion de Crise",
    description: "Lors d'événements majeurs (panne générale, crise sanitaire, etc.) générant un pic d'appels, mise en place d'un SVI intelligent capable d'identifier rapidement la nature de l'appel. Il priorise les appels réellement urgents (ex: sécurité, situation critique) vers les agents et dévie les autres en leur fournissant des informations contextuelles (statut de la panne, consignes) ou en les orientant vers des canaux alternatifs.",
    technology: "NLP, Speech recognition, Système de priorisation, Gestion de flux",
    deadline: "2026-Q1",
    contact: "Laurent Mercier",
    benefits: [
      "Gestion optimisée des pics d'appels en situation de crise",
      "Traitement prioritaire des cas réellement urgents",
      "Information proactive réduisant le nombre d'appels",
      "Meilleure utilisation des ressources limitées en crise",
      "Réduction du stress des agents pendant les pics"
    ],
    metrics: [
      "Précision de la qualification des appels urgents",
      "Taux de déflection des appels non critiques",
      "Temps d'attente moyen pour les cas prioritaires",
      "Satisfaction client en situation de crise"
    ],
    risks: [
      "Mauvaise qualification d'appels réellement urgents",
      "Frustration des clients déviés vers l'information",
      "Défaillance du système pendant un pic d'activité",
      "Complexité de définir des règles valables pour divers scénarios",
      "Formation insuffisante à la gestion de situation exceptionnelle"
    ],
    nextSteps: [
      "Définir les critères précis de qualification des urgences",
      "Établir les scénarios de crise prioritaires",
      "Développer les flux d'information automatisés",
      "Concevoir les messages contextuels par type de crise",
      "Planifier les tests de charge du système"
    ],
    sources: [
      "Historique des appels en période de crise",
      "Système de gestion des incidents",
      "Plans de continuité d'activité",
      "Base de données clients prioritaires",
      "Système d'information géographique (pannes localisées)"
    ],
    relatedData: [
      "Statut des services et infrastructures",
      "Localisation géographique des incidents",
      "Classification des clients (prioritaires, vulnérables)",
      "Historique des pannes précédentes",
      "Capacité des équipes d'intervention"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 5, description: "Vice-Présidence Exécutive / Comité Exécutif avec intérêt direct pour la gestion de crise" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 5, description: "Amélioration majeure sur motifs critiques (pannes) avec fort impact potentiel sur CSAT/NPS en situations difficiles." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Optimisation importante de l'utilisation des ressources en période de crise, automatisation partielle de l'information." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 4, description: "Réduction significative du stress en période de crise, meilleure gestion des appels réellement prioritaires." },
      { axisId: "Conformité & Image Publique", rating: 5, description: "Renforce significativement l'image publique sur la gestion des situations critiques et la réactivité de l'entreprise." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 3, description: "Technologie de qualification d'appels maîtrisée mais nécessitant une adaptation fine pour les situations de crise. Fiabilité critique." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 4, description: "Intégration avec systèmes de téléphonie, gestion d'incidents, information client, nécessitant une orchestration robuste." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de données standards, enjeu éthique modéré lié à la priorisation des appels en situation critique." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 3, description: "Données réparties entre quelques systèmes, besoin d'accès en temps réel aux informations de crise." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 4, description: "Changement important des processus de gestion de crise, formation approfondie nécessaire, tests réguliers à prévoir." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 9: Analyse Tendances Motifs d'Appel
  {
    id: "UC009",
    name: "Analyse Tendances Motifs d'Appel",
    domain: "Analyse & Insights",
    description: "Traitement et analyse (a posteriori) d'un grand volume de données d'appels (transcriptions, métadonnées, catégories CRM) pour identifier automatiquement les motifs d'appel récurrents, détecter des tendances émergentes, repérer les points de friction fréquents dans le parcours client et découvrir des opportunités d'amélioration des processus ou des outils self-service.",
    technology: "NLP, Analyse de texte, Topic modeling, Clustering, Analytics",
    deadline: "2025-Q3",
    contact: "Sarah Lemoine",
    benefits: [
      "Identification proactive des problèmes systémiques",
      "Optimisation ciblée des processus problématiques",
      "Réduction des appels évitables par amélioration préventive",
      "Enrichissement de la base de connaissances sur points sensibles",
      "Meilleure allocation des ressources formation"
    ],
    metrics: [
      "Nombre de problèmes systémiques identifiés",
      "Réduction du volume d'appels sur motifs optimisés",
      "ROI des améliorations implémentées",
      "Précision de la détection de nouvelles tendances"
    ],
    risks: [
      "Fausses corrélations menant à des conclusions erronées",
      "Volume insuffisant pour certains motifs spécifiques",
      "Qualité variable des données (catégorisation inconsistante)",
      "Difficulté à transformer insights en actions concrètes",
      "Manque de suivi des recommandations"
    ],
    nextSteps: [
      "Inventaire des sources de données disponibles",
      "Définition des objectifs d'analyse prioritaires",
      "Conception des tableaux de bord pour décideurs",
      "Établissement du processus de suivi des insights",
      "Formation des équipes à l'interprétation des données"
    ],
    sources: [
      "Transcriptions d'appels",
      "Catégories d'appels du CRM",
      "Métadonnées d'appels (durée, transferts)",
      "Enquêtes satisfaction post-appel",
      "Données de navigation web et app"
    ],
    relatedData: [
      "Motifs de contact par canal",
      "Parcours client multi-canal",
      "Données socio-démographiques",
      "Saisonnalité des contacts",
      "Performance des outils self-service"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 4, description: "Direction Principale / VP Service Client avec fort intérêt pour l'optimisation continue" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Impact indirect mais significatif via l'amélioration continue des processus et la réduction des irritants identifiés." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 3, description: "Réduction significative à moyen terme des appels évitables grâce à l'optimisation des processus problématiques." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 2, description: "Impact modéré via l'optimisation des processus frustrants pour les agents." },
      { axisId: "Conformité & Image Publique", rating: 2, description: "Aide marginale à identifier les sujets sensibles ou préoccupations émergentes pouvant affecter l'image." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 3, description: "Technologie d'analyse textuelle maîtrisée mais nécessitant adaptation au contexte spécifique et au jargon du domaine." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Intégration avec les systèmes de données existants, développement modéré pour les tableaux de bord analytiques." },
      { axisId: "IA Responsable & Conformité Données", rating: 2, description: "Utilisation de données agrégées avec peu de risques éthiques, anonymisation simple possible." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 5, description: "Données dispersées entre de nombreux systèmes, qualité hétérogène, effort de nettoyage et harmonisation considérable." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 2, description: "Impact organisationnel modéré, principalement au niveau de l'adoption des recommandations issues des analyses." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 10: Communication Proactive Ciblée (Prévention d'Appels)
  {
    id: "UC010",
    name: "Communication Proactive Ciblée (Prévention d'Appels)",
    domain: "Marketing & Communication",
    description: "Utilisation de modèles d'IA pour analyser les données client (historique, profil, événements récents comme une facture élevée ou une panne signalée) afin d'identifier les clients ayant une forte probabilité d'appeler prochainement. Envoi proactif d'une communication ciblée (SMS, email, notification push) avec des informations pertinentes pour résoudre leur problème potentiel avant même qu'ils ne contactent le service client.",
    technology: "Machine Learning prédictif, IA comportementale, Automatisation marketing",
    deadline: "2025-Q4",
    contact: "Nicolas Girard",
    benefits: [
      "Réduction du volume d'appels entrants",
      "Amélioration de l'expérience client proactive",
      "Diminution des pics d'appels prévisibles",
      "Optimisation de l'utilisation des canaux self-service",
      "Perception d'une entreprise attentive aux besoins"
    ],
    metrics: [
      "Taux de réduction des appels sur motifs ciblés",
      "Taux d'engagement avec les communications proactives",
      "Précision du modèle prédictif",
      "Satisfaction client envers la communication proactive"
    ],
    risks: [
      "Communications perçues comme intrusives",
      "Mauvais ciblage générant confusion ou inquiétude",
      "Problèmes de timing des communications",
      "Cannibalisation entre canaux de communication",
      "Dépendance excessive aux modèles prédictifs"
    ],
    nextSteps: [
      "Identifier les motifs d'appels les plus prévisibles",
      "Développer des modèles prédictifs pour ces motifs",
      "Concevoir les templates de communication par canal",
      "Établir les règles de priorisation et fréquence",
      "Tester sur un segment client limité"
    ],
    sources: [
      "CRM et historique d'interactions",
      "Système de facturation",
      "Système de gestion des incidents",
      "Données de comportement digital",
      "Historique des communications"
    ],
    relatedData: [
      "Préférences de communication client",
      "Historique des paiements",
      "Données d'usage des services",
      "Segments client",
      "Modèles de propension à appeler"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 4, description: "Direction Principale / VP Service Client avec soutien du marketing relationnel" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 4, description: "Amélioration sensible de l'expérience par la proactivité et l'anticipation des besoins, réduction significative de l'effort client." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 4, description: "Réduction importante du volume d'appels prévisibles, meilleure répartition de la charge, économie estimée à 3-5 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 2, description: "Impact modéré via la réduction des appels répétitifs et prévisibles." },
      { axisId: "Conformité & Image Publique", rating: 4, description: "Renforce significativement l'image d'une entreprise proactive, attentionnée et technologiquement avancée." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 4, description: "Modèles prédictifs complexes nécessitant validation poussée et affinage constant pour éviter faux positifs et négatifs." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 4, description: "Intégration avec multiples systèmes (CRM, facturation, communication), orchestration des canaux de sortie, règles complexes." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de données comportementales, gestion des préférences de contact, transparence sur l'utilisation des données." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 4, description: "Données dans plusieurs systèmes, qualité variable selon les sources, effort important d'harmonisation pour prédictions fiables." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification des processus de communication, coordination entre équipes service client et communication, formation nécessaire." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 11: Simulation & Coaching IA pour Agents
  {
    id: "UC011",
    name: "Simulation & Coaching IA pour Agents",
    domain: "Formation & Développement",
    description: "Mise à disposition d'une plateforme où les agents peuvent s'entraîner en interagissant avec des clients simulés par une IA dans divers scénarios d'appel (vente, support, réclamation...). L'IA évalue la performance de l'agent en temps réel ou a posteriori, fournit un feedback détaillé et personnalisé sur les points forts et les axes d'amélioration (empathie, respect des procédures, clarté...).",
    technology: "NLP, IA générative, Simulation conversationnelle, Analytics",
    deadline: "2026-Q3",
    contact: "Isabelle Leroy",
    benefits: [
      "Formation continue sans impact sur les clients réels",
      "Personnalisation du développement des compétences",
      "Standardisation de l'évaluation des performances",
      "Possibilité de simuler des scénarios rares ou difficiles",
      "Réduction du temps de montée en compétence"
    ],
    metrics: [
      "Amélioration des KPIs par agent après formation",
      "Temps moyen d'acquisition des compétences",
      "Taux d'engagement des agents avec la plateforme",
      "Corrélation entre scores simulation et performance réelle"
    ],
    risks: [
      "Écart entre simulation et réalité des interactions",
      "Acceptation limitée par certains agents seniors",
      "Difficulté à simuler certaines nuances émotionnelles",
      "Coût de développement des scénarios de formation",
      "Ressources nécessaires pour maintenir les contenus"
    ],
    nextSteps: [
      "Identifier les compétences prioritaires à développer",
      "Concevoir les premiers scénarios d'entraînement",
      "Développer le système d'évaluation et feedback",
      "Tester avec un groupe pilote d'agents volontaires",
      "Établir le plan d'intégration à la formation continue"
    ],
    sources: [
      "Référentiels de compétences existants",
      "Enregistrements d'appels exemplaires",
      "Grilles d'évaluation actuelles",
      "Feedbacks formateurs et superviseurs",
      "Scénarios de formation existants"
    ],
    relatedData: [
      "Profils de compétences par agent",
      "Historique de formation",
      "Performances individuelles",
      "Parcours de progression",
      "Indicateurs qualité par agent"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 3, description: "Direction Service Client / TI avec soutien des responsables formation" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Impact indirect mais significatif via l'amélioration des compétences des agents, particulièrement pour les cas complexes." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 3, description: "Réduction du temps et des coûts de formation, amélioration progressive de l'efficacité des agents, économie estimée à 2-3 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 5, description: "Impact majeur sur la confiance, l'autonomie et la progression professionnelle des agents, réduction significative du stress des nouveaux agents." },
      { axisId: "Conformité & Image Publique", rating: 3, description: "Aide à maintenir la conformité via un meilleur apprentissage des procédures réglementaires et mentions obligatoires." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 4, description: "Technologie de simulation conversationnelle avancée nécessitant adaptation importante et itérations multiples." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Développement modéré avec intégration au LMS existant, création continue de contenu nécessaire mais gérable." },
      { axisId: "IA Responsable & Conformité Données", rating: 2, description: "Utilisation principalement de données de formation, risques éthiques limités, transparence dans l'évaluation automatisée." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 3, description: "Données d'entraînement dans quelques systèmes, besoin de créer des corpus représentatifs de qualité." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 4, description: "Changement important dans les méthodes de formation et d'évaluation, accompagnement soutenu des formateurs et superviseurs nécessaire." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 12: Détection Anomalies & Fraude Potentielle
  {
    id: "UC012",
    name: "Détection Anomalies & Fraude Potentielle",
    domain: "Sécurité & Fraude",
    description: "Application de techniques d'IA (machine learning) pour analyser en continu les données transactionnelles, les logs d'accès et les comportements utilisateurs (clients ou agents) afin de détecter des schémas inhabituels ou suspects pouvant indiquer une tentative de fraude, une faille de sécurité ou un abus. Génération d'alertes pour investigation.",
    technology: "Machine Learning, Détection d'anomalies, Analyse comportementale",
    deadline: "2026-Q2",
    contact: "Marc Fournier",
    benefits: [
      "Détection précoce des tentatives de fraude",
      "Réduction des pertes financières liées aux fraudes",
      "Amélioration de la sécurité des comptes clients",
      "Identification des vulnérabilités des processus",
      "Conformité avec les réglementations anti-fraude"
    ],
    metrics: [
      "Taux de détection des fraudes confirmées",
      "Taux de faux positifs",
      "Temps entre activité suspecte et détection",
      "Économies réalisées par prévention de fraudes"
    ],
    risks: [
      "Taux de faux positifs élevé mobilisant les ressources",
      "Faux négatifs laissant passer des fraudes réelles",
      "Difficultés d'explication des alertes (boîte noire)",
      "Évolution constante des méthodes de fraude",
      "Impact sur l'expérience client légitime"
    ],
    nextSteps: [
      "Inventorier les types de fraudes connus et prioritaires",
      "Identifier les sources de données pertinentes",
      "Développer les premiers modèles de détection",
      "Établir le processus d'investigation des alertes",
      "Former l'équipe anti-fraude aux nouveaux outils"
    ],
    sources: [
      "Logs de transaction",
      "Historique des cas de fraude confirmés",
      "Logs d'accès systèmes",
      "Activité des comptes client",
      "Activité des agents dans les systèmes"
    ],
    relatedData: [
      "Profils de risque clients",
      "Comportements transactionnels habituels",
      "Données géographiques d'accès",
      "Métadonnées des appareils",
      "Historique des changements de compte"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 5, description: "Vice-Présidence Exécutive / Comité Exécutif avec fort soutien de la sécurité et des finances" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 3, description: "Impact modéré via une meilleure sécurisation des comptes et réduction des utilisations frauduleuses affectant les clients." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 3, description: "Réduction du temps consacré aux cas de fraude avérés, meilleure priorisation des investigations." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 3, description: "Simplification du processus d'identification des cas suspects, réduction du stress lié aux décisions de sécurité." },
      { axisId: "Conformité & Image Publique", rating: 5, description: "Renforce significativement la conformité avec réglementations anti-fraude et protection des données, impact majeur sur la confiance." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 4, description: "Technologies de détection d'anomalies avancées nécessitant adaptation constante aux nouvelles méthodes de fraude." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 4, description: "Intégration complexe avec multiples systèmes transactionnels et de sécurité, développement d'interfaces de gestion des alertes." },
      { axisId: "IA Responsable & Conformité Données", rating: 4, description: "Utilisation de données sensibles, risque de biais dans la détection, nécessité d'explicabilité des alertes, enjeux éthiques importants." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 4, description: "Données dispersées entre nombreux systèmes, hétérogénéité des formats, accès sécurisé complexe." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification des processus d'investigation, formation approfondie de l'équipe sécurité, communication importante sur les nouvelles procédures." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  },
  
  // Cas d'usage 13: Analyse Parcours Client Self-Service (Web/App)
  {
    id: "UC013",
    name: "Analyse Parcours Client Self-Service (Web/App)",
    domain: "Expérience Digitale",
    description: "Utilisation de l'IA pour analyser les données de navigation et d'interaction des utilisateurs sur les plateformes self-service (site web, application mobile, espace client), afin d'identifier automatiquement les points de blocage, les parcours inefficaces, les pages générant des erreurs ou des abandons, afin d'optimiser l'ergonomie et le contenu pour améliorer le taux de self-service et réduire le besoin de support.",
    technology: "Analytics avancés, IA comportementale, Visualisation de parcours",
    deadline: "2025-Q4",
    contact: "Audrey Moreau",
    benefits: [
      "Identification proactive des frictions dans les parcours digitaux",
      "Optimisation ciblée des zones à fort taux d'abandon",
      "Augmentation du taux de résolution en self-service",
      "Réduction des contacts évitables après échec digital",
      "Meilleur retour sur investissement des canaux digitaux"
    ],
    metrics: [
      "Amélioration du taux de conversion des parcours clés",
      "Réduction du taux d'abandon",
      "Diminution des contacts post-tentative digitale",
      "Score d'effort client (CES) sur les parcours optimisés"
    ],
    risks: [
      "Difficulté à établir des causalités claires",
      "Interprétation erronée des comportements utilisateurs",
      "Ressources limitées pour implémenter les améliorations",
      "Multiplicité des parcours et appareils à analyser",
      "Résistance au changement des équipes digitales"
    ],
    nextSteps: [
      "Identifier les parcours digitaux prioritaires",
      "Configurer le tracking avancé des interactions",
      "Établir les KPIs de référence par parcours",
      "Développer les tableaux de bord d'analyse",
      "Définir le processus d'optimisation continue"
    ],
    sources: [
      "Analytics web et mobile",
      "Logs de navigation",
      "Feedback utilisateurs",
      "Données de support post-tentative digitale",
      "Heatmaps et enregistrements de sessions"
    ],
    relatedData: [
      "Segments utilisateurs",
      "Appareils et navigateurs utilisés",
      "Temps passé par page/étape",
      "Taux de conversion par parcours",
      "Erreurs techniques rencontrées"
    ],
    valueScores: [
      { axisId: "Niveau de Sponsorship", rating: 4, description: "Direction Principale / VP Service Client avec fort support de l'équipe digitale" },
      { axisId: "Impact Satisfaction Client (CSAT/NPS)", rating: 4, description: "Amélioration sensible de l'expérience digitale sur des parcours clés et réduction significative de l'effort client." },
      { axisId: "Gains de Productivité (Agents & Opérations)", rating: 3, description: "Réduction significative des contacts suite à des échecs de self-service, économie estimée à 2-3 ETP." },
      { axisId: "Amélioration Expérience Agent & Rétention", rating: 2, description: "Impact modéré via la réduction des appels liés à des frustrations digitales souvent complexes à gérer." },
      { axisId: "Conformité & Image Publique", rating: 3, description: "Aide à améliorer l'image sur l'aspect facilité d'usage et modernité des outils digitaux." },
    ],
    complexityScores: [
      { axisId: "Maturité & Fiabilité Solution IA", rating: 3, description: "Technologie d'analyse comportementale établie mais nécessitant paramétrage fin selon les objectifs spécifiques." },
      { axisId: "Effort d'Implémentation & Intégration", rating: 3, description: "Intégration modérée avec les plateformes digitales existantes, outils d'analytics, et systèmes CRM." },
      { axisId: "IA Responsable & Conformité Données", rating: 3, description: "Utilisation de données de navigation avec consentement, anonymisation partielle possible, transparence nécessaire." },
      { axisId: "Disponibilité, Qualité & Accès Données", rating: 4, description: "Données réparties entre plusieurs systèmes (web analytics, CRM, logs), qualité variable, effort d'harmonisation conséquent." },
      { axisId: "Gestion du Changement & Impact Métier", rating: 3, description: "Modification des processus d'optimisation digitale, collaboration accrue nécessaire entre équipes digitales et service client." },
    ],
    totalValueScore: 0,
    totalComplexityScore: 0,
  }
];

// Calculate initial scores for each use case and add them to the initial use cases
const initialUseCases = newUseCases.map(useCase => calcInitialScore(useCase, defaultMatrixConfig));

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
  generateUseCases: () => Promise<void>;
  updateThresholds: (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => void;
  countUseCasesInLevel: (isValue: boolean, level: number) => number;
  isGenerating: boolean;
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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Effect to update cases count in thresholds whenever useCases changes
  useEffect(() => {
    updateCasesCounts();
    // Only depend on useCases, not on threshold states which get updated in updateCasesCounts
  }, [useCases]);
  
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

  // Helper function to determine value level based on thresholds
  const getValueLevel = (score: number | undefined) => {
    if (score === undefined || !matrixConfig.valueThresholds) return 0;
    
    for (let i = matrixConfig.valueThresholds.length - 1; i >= 0; i--) {
      const threshold = matrixConfig.valueThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1; // Default minimum level
  };
  
  // Helper function to determine complexity level based on thresholds
  const getComplexityLevel = (score: number | undefined) => {
    if (score === undefined || !matrixConfig.complexityThresholds) return 0;
    
    for (let i = matrixConfig.complexityThresholds.length - 1; i >= 0; i--) {
      const threshold = matrixConfig.complexityThresholds[i];
      if (score >= threshold.threshold) {
        return threshold.level;
      }
    }
    return 1; // Default minimum level
  };
  
  // Update cases counts in thresholds
  const updateCasesCounts = () => {
    if (!matrixConfig.valueThresholds || !matrixConfig.complexityThresholds) return;
    
    // Create new arrays to avoid mutating state directly
    const updatedValueThresholds = [...matrixConfig.valueThresholds].map(threshold => ({
      ...threshold,
      cases: 0
    }));
    
    const updatedComplexityThresholds = [...matrixConfig.complexityThresholds].map(threshold => ({
      ...threshold,
      cases: 0
    }));
    
    // Count use cases for each level
    useCases.forEach(useCase => {
      const valueLevel = getValueLevel(useCase.totalValueScore);
      const complexityLevel = getComplexityLevel(useCase.totalComplexityScore);
      
      const valueThreshold = updatedValueThresholds.find(t => t.level === valueLevel);
      if (valueThreshold) {
        valueThreshold.cases = (valueThreshold.cases || 0) + 1;
      }
      
      const complexityThreshold = updatedComplexityThresholds.find(t => t.level === complexityLevel);
      if (complexityThreshold) {
        complexityThreshold.cases = (complexityThreshold.cases || 0) + 1;
      }
    });
    
    // Update matrix configuration with new counts but avoid a re-render if values are the same
    if (JSON.stringify(updatedValueThresholds) !== JSON.stringify(matrixConfig.valueThresholds) || 
        JSON.stringify(updatedComplexityThresholds) !== JSON.stringify(matrixConfig.complexityThresholds)) {
      setMatrixConfig(prevConfig => ({
        ...prevConfig,
        valueThresholds: updatedValueThresholds,
        complexityThresholds: updatedComplexityThresholds
      }));
    }
  };

  // Update thresholds
  const updateThresholds = (valueThresholds?: LevelThreshold[], complexityThresholds?: LevelThreshold[]) => {
    setMatrixConfig(prevConfig => ({ 
      ...prevConfig,
      valueThresholds: valueThresholds || prevConfig.valueThresholds,
      complexityThresholds: complexityThresholds || prevConfig.complexityThresholds
    }));
  };
  
  // Count use cases in a specific level
  const countUseCasesInLevel = (isValue: boolean, level: number): number => {
    return useCases.filter(useCase => {
      if (isValue) {
        return getValueLevel(useCase.totalValueScore) === level;
      } else {
        return getComplexityLevel(useCase.totalComplexityScore) === level;
      }
    }).length;
  };
  
  // Generate new use cases based on user input using OpenAI
  const generateUseCases = async () => {
    if (currentInput.trim().length === 0) {
      toast.error("Veuillez saisir une description de votre activité");
      return;
    }

    // Get OpenAI API key from localStorage
    const apiKey = localStorage.getItem(OPENAI_API_KEY);
    if (!apiKey) {
      toast.error("Clé API OpenAI non configurée", {
        description: "Veuillez configurer votre clé API dans les paramètres",
        action: {
          label: "Paramètres",
          onClick: () => window.location.href = "/parametres",
        },
      });
      return;
    }

    // Get prompts from localStorage or use defaults
    const listPrompt = localStorage.getItem(USE_CASE_LIST_PROMPT) || DEFAULT_USE_CASE_LIST_PROMPT;
    const detailPrompt = localStorage.getItem(USE_CASE_DETAIL_PROMPT) || DEFAULT_USE_CASE_DETAIL_PROMPT;

    const openai = new OpenAIService(apiKey);
    setIsGenerating(true);
    
    try {
      // Step 1: Generate list of use case titles
      toast.info("Génération des cas d'usage en cours...");
      const useCaseTitles = await openai.generateUseCaseList(currentInput, listPrompt);
      
      if (useCaseTitles.length === 0) {
        toast.error("Aucun cas d'usage généré. Veuillez reformuler votre demande.");
        setIsGenerating(false);
        return;
      }

      // Step 2: For each use case title, generate detailed use case
      const newUseCases: UseCase[] = [];
      
      for (const title of useCaseTitles) {
        try {
          const useCaseDetail = await openai.generateUseCaseDetail(
            title,
            currentInput,
            matrixConfig,
            detailPrompt
          );
          
          // Calculate scores for the use case
          const scoredUseCase = calcInitialScore(useCaseDetail, matrixConfig);
          newUseCases.push(scoredUseCase);
          
          // Add the use case immediately to show progressive updates
          setUseCases(prev => [...prev, scoredUseCase]);
          
        } catch (error) {
          console.error(`Error generating details for "${title}":`, error);
        }
      }

      // Finalize the generation process
      if (newUseCases.length > 0) {
        openai.finalizeGeneration(true, newUseCases.length);
        setCurrentInput("");
      } else {
        openai.finalizeGeneration(false, 0);
      }
    } catch (error) {
      console.error("Error in use case generation:", error);
      toast.error("Erreur lors de la génération des cas d'usage", {
        description: (error as Error).message,
      });
    } finally {
      setIsGenerating(false);
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
    generateUseCases,
    updateThresholds,
    countUseCasesInLevel,
    isGenerating
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
