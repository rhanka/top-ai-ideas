import { UseCase } from "@/types";

const businessIntCases: UseCase[] = [
  {
    "id": "UC09",
    "name": "Analyse Tendances Motifs d'Appel",
    "domain": "Business Intelligence",
    "process": "Business Intelligence",
    "description": "Traitement et analyse (a posteriori) d'un grand volume de données d'appels (transcriptions, métadonnées, catégories CRM) pour identifier automatiquement les motifs d'appel récurrents, détecter des tendances émergentes, repérer les points de friction fréquents dans le parcours client et découvrir des opportunités d'amélioration des processus ou des outils self-service.",
    "technology": "Text Mining / Machine Learning / Business Intelligence",
    "deadline": "2026-Q2",
    "contact": "Antoine Girard - Dir. Intelligence Client",
    "benefits": [
      "Identification proactive des problèmes émergents",
      "Optimisation ciblée des processus problématiques",
      "Réduction des appels évitables",
      "Amélioration de la documentation self-service",
      "Support à la prise de décision stratégique"
    ],
    "metrics": [
      "Précision de la catégorisation automatique",
      "Taux d'identification de nouveaux motifs",
      "ROI des optimisations basées sur les insights",
      "Réduction des appels pour motifs identifiés"
    ],
    "risks": [
      "Complexité de l'analyse de données non structurées",
      "Biais potentiels dans l'interprétation des tendances",
      "Défis d'intégration des données multi-sources",
      "Risque de faux positifs dans l'identification des patterns"
    ],
    "nextSteps": [
      "Identifier et connecter les sources de données pertinentes",
      "Développer les algorithmes de catégorisation et clustering",
      "Créer un tableau de bord analytique pour les décideurs",
      "Établir un processus de conversion des insights en actions",
      "Mettre en place un cycle d'amélioration continue"
    ],
    "sources": [
      "Transcriptions d'appels",
      "Métadonnées des interactions client",
      "CRM (catégorisation des contacts)",
      "Logs des parcours digitaux",
      "Feedbacks client"
    ],
    "relatedData": [
      "Historique des modifications produit/service",
      "Données de performance opérationnelle",
      "KPIs de satisfaction client",
      "Statistiques d'utilisation des canaux"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 4,
        "description": "Soutenu fortement par la Direction de l'Intelligence Client et la Direction des Opérations qui voient un potentiel stratégique important."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 3,
        "description": "Impact indirect mais significatif via l'identification et la résolution proactive des irritants récurrents affectant l'expérience client."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Réduction potentielle du volume d'appels pour des problèmes récurrents grâce à l'optimisation des processus et la documentation proactive."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 3,
        "description": "Bénéfice modéré pour les agents via la réduction des appels frustrants récurrents et l'amélioration des processus problématiques."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 4,
        "description": "Amélioration de la conformité grâce à l'identification systématique des problèmes liés à la réglementation et la correction proactive."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 3,
        "description": "Technologies d'analyse textuelle et de découverte de patterns relativement matures mais nécessitant une adaptation aux données spécifiques de l'entreprise."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 4,
        "description": "Intégration complexe avec de multiples sources de données hétérogènes et développement d'une plateforme analytique avancée."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 3,
        "description": "Traitement de grandes quantités de données client nécessitant des mesures d'anonymisation et de protection, mais principalement en mode analytique agrégé."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 5,
        "description": "Défi majeur d'extraction, transformation et nettoyage de données provenant de multiples systèmes sur de longues périodes, avec des problèmes de standardisation."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 3,
        "description": "Changement modéré des processus décisionnels nécessitant une formation des analystes et managers à l'utilisation des nouveaux insights."
      }
    ],
    "totalValueScore": 2500,
    "totalComplexityScore": 950
  },
  {
    "id": "UC07",
    "name": "Agent Assist - Suggestions Temps Réel",
    "domain": "Support Agent",
    "process": "Business Intelligence",
    "description": "Analyse en temps réel de la conversation entre l'agent et le client pour comprendre le contexte et le besoin. Le système suggère alors de manière proactive à l'agent des informations pertinentes : articles de la base de connaissances, étapes de procédure à suivre, réponses types, informations client spécifiques, etc., affichées directement sur son écran.",
    "technology": "NLP / Machine Learning / RAG",
    "deadline": "2026-Q1",
    "contact": "Sophie Dupont - Resp. Excellence Opérationnelle",
    "benefits": [
      "Réduction du temps de recherche d'information de 20-30%",
      "Amélioration de la précision des réponses fournies",
      "Diminution du temps de formation des nouveaux agents",
      "Augmentation de la consistance du service",
      "Réduction du stress agent face aux questions complexes"
    ],
    "metrics": [
      "Taux d'utilisation des suggestions",
      "Réduction du temps de traitement moyen",
      "Score qualité des réponses fournies",
      "Satisfaction des agents utilisateurs"
    ],
    "risks": [
      "Suggestions non pertinentes créant de la distraction",
      "Dépendance excessive aux suggestions automatisées",
      "Surcharge d'information sur l'interface agent",
      "Temps d'adaptation initial impactant la productivité"
    ],
    "nextSteps": [
      "Analyser les motifs d'appel et parcours de recherche actuels",
      "Concevoir l'interface utilisateur avec des agents pilotes",
      "Développer le moteur d'analyse conversationnelle",
      "Connecter le système à la base de connaissances",
      "Mettre en place un mécanisme de feedback pour amélioration continue"
    ],
    "sources": [
      "Base de connaissances",
      "Transcriptions d'appels",
      "Historique des recherches agent",
      "CRM",
      "Systèmes techniques"
    ],
    "relatedData": [
      "Questions fréquentes par catégorie",
      "Procédures de résolution par type de problème",
      "Profils client et historique",
      "Données techniques des produits/services"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 3,
        "description": "Soutenu par la Direction Service Client et l'équipe d'Excellence Opérationnelle qui voient un potentiel d'optimisation des processus."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 4,
        "description": "Amélioration notable de l'expérience client grâce à des réponses plus rapides, précises et cohérentes, réduisant les transferts et rappels."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Réduction significative du temps de recherche d'information et d'identification des solutions, estimée à 30-45 secondes par interaction."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 5,
        "description": "Impact très positif sur l'expérience agent en réduisant la pression cognitive et en fournissant un soutien constant, particulièrement valorisé par les nouveaux agents."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 3,
        "description": "Amélioration modérée de la conformité en garantissant l'accès aux procédures et informations réglementaires à jour pendant les interactions."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 4,
        "description": "Technologies avancées d'analyse conversationnelle en temps réel et de recommandation contextuelle nécessitant une R&D significative et des tests approfondis."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 4,
        "description": "Intégration complexe avec multiple systèmes (téléphonie, CRM, base de connaissances) et développement d'une interface agent intuitive et non intrusive."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 3,
        "description": "Traitement de données client et conversationnelles nécessitant des mesures de protection mais sans manipulation de données hautement sensibles."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 4,
        "description": "Nécessité d'accéder en temps réel à des données distribuées dans plusieurs systèmes et de structurer la base de connaissances pour une exploitation optimale."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 4,
        "description": "Modification importante des habitudes de travail des agents nécessitant une formation approfondie et un accompagnement soutenu pour garantir l'adoption."
      }
    ],
    "totalValueScore": 2500,
    "totalComplexityScore": 1050
  }
];

export default businessIntCases;
