import { UseCase } from "@/types";

const trainingCases: UseCase[] = [
  {
    "id": "UC06",
    "name": "Analyse Qualité & Sentiment Appel",
    "domain": "Qualité & Formation",
    "process": "Formation",
    "description": "Analyse automatisée des enregistrements ou transcriptions d'appels pour évaluer la qualité de l'interaction selon une grille prédéfinie. Détection automatique du sentiment global du client (positif, négatif, neutre), identification de mots-clés spécifiques (irritants, motifs de satisfaction, termes liés à la conformité) et attribution d'un score de qualité.",
    "technology": "NLP / Analyse de sentiment / Speech Analytics",
    "deadline": "2025-Q2",
    "contact": "Marc Petit - Dir. Qualité & Formation",
    "benefits": [
      "Évaluation objective et consistante de 100% des appels vs échantillon manuel",
      "Identification précoce des problèmes récurrents",
      "Amélioration ciblée de la formation des agents",
      "Détection des appels à risque nécessitant suivi",
      "Gains de temps pour les superviseurs qualité"
    ],
    "metrics": [
      "Précision de la détection de sentiment",
      "Taux de conformité des appels analysés",
      "Corrélation entre scores automatiques et évaluations manuelles",
      "Évolution des indicateurs qualité globaux"
    ],
    "risks": [
      "Fiabilité de l'analyse de sentiment dans des contextes ambigus",
      "Résistance des évaluateurs qualité traditionnels",
      "Perception négative par les agents (surveillance)",
      "Mauvaise interprétation de certains contextes conversationnels"
    ],
    "nextSteps": [
      "Définir une grille d'évaluation automatisée",
      "Collecter et annoter un ensemble d'appels pour l'entraînement",
      "Développer et calibrer les modèles d'analyse",
      "Créer un tableau de bord pour les superviseurs",
      "Intégrer les résultats au processus de coaching des agents"
    ],
    "sources": [
      "Enregistrements d'appels",
      "Transcriptions",
      "Grilles d'évaluation qualité",
      "Feedbacks client post-interaction"
    ],
    "relatedData": [
      "Évaluations qualité historiques",
      "Scores de satisfaction client",
      "Données de performance des agents",
      "Motifs d'appel et résolution"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 4,
        "description": "Fort soutien de la Direction Principale Qualité qui considère ce projet comme stratégique pour l'amélioration continue du service."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 3,
        "description": "Impact indirect mais significatif via l'amélioration de la qualité des interactions et la résolution proactive des irritants identifiés."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Réduction importante du temps consacré aux évaluations manuelles et optimisation du temps de coaching grâce à des analyses ciblées."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 3,
        "description": "Impact potentiellement mixte: feedback plus régulier et objectif mais risque de perception de surveillance accrue."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 5,
        "description": "Amélioration majeure de la conformité grâce au contrôle systématique des interactions et à la détection automatique des écarts aux scripts obligatoires."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 4,
        "description": "Technologies d'analyse de sentiment et de qualité conversationnelle avancées mais nécessitant un entraînement spécifique et une validation poussée."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 3,
        "description": "Intégration modérée avec les systèmes d'enregistrement existants et développement d'interfaces pour les superviseurs qualité."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 4,
        "description": "Traitement de conversations client potentiellement sensibles nécessitant des mesures de protection des données et une transparence vis-à-vis des agents."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 3,
        "description": "Besoin d'un corpus d'entraînement important et varié d'appels annotés, mais les systèmes d'enregistrement existants fournissent déjà une base."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 4,
        "description": "Changement significatif du processus d'évaluation qualité nécessitant une redéfinition des rôles des superviseurs et une communication soignée auprès des agents."
      }
    ],
    "totalValueScore": 2600,
    "totalComplexityScore": 900
  },
  {
    "id": "UC11",
    "name": "Simulation & Coaching IA pour Agents",
    "domain": "Formation & Développement",
    "process": "Formation",
    "description": "Mise à disposition d'une plateforme où les agents peuvent s'entraîner en interagissant avec des clients simulés par une IA dans divers scénarios d'appel (vente, support, réclamation...). L'IA évalue la performance de l'agent en temps réel ou a posteriori, fournit un feedback détaillé et personnalisé sur les points forts et les axes d'amélioration (empathie, respect des procédures, clarté...).",
    "technology": "NLP / Simulation conversationnelle / IA Générative",
    "deadline": "2026-Q3",
    "contact": "Isabelle Moreau - Dir. Formation",
    "benefits": [
      "Réduction du temps de formation initiale de 20-30%",
      "Standardisation de l'évaluation des compétences",
      "Entraînement continu sans impact sur les clients réels",
      "Montée en compétence ciblée sur les points faibles",
      "Amélioration de la qualité des interactions client"
    ],
    "metrics": [
      "Temps de formation jusqu'à l'autonomie",
      "Scores de qualité des agents formés avec l'IA",
      "Taux d'utilisation volontaire de la plateforme",
      "Amélioration mesurée des compétences ciblées"
    ],
    "risks": [
      "Scénarios simulés trop artificiels ou prévisibles",
      "Résistance des formateurs traditionnels",
      "Coût élevé de développement des scénarios",
      "Difficulté à simuler certaines situations émotionnelles"
    ],
    "nextSteps": [
      "Cartographier les compétences critiques à évaluer",
      "Concevoir une bibliothèque de scénarios représentatifs",
      "Développer les modèles conversationnels simulés",
      "Créer le système d'évaluation et de feedback",
      "Former les responsables formation à l'utilisation"
    ],
    "sources": [
      "Enregistrements d'interactions réelles",
      "Grilles d'évaluation existantes",
      "Modules de formation actuels",
      "Feedbacks des clients et superviseurs"
    ],
    "relatedData": [
      "Profils de compétence des agents",
      "Historique de performance individuelle",
      "Données d'évaluation et coaching",
      "Best practices identifiées"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 3,
        "description": "Soutenu par la Direction Formation et les responsables opérationnels qui y voient un potentiel d'optimisation de l'onboarding."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 3,
        "description": "Impact indirect mais significatif via l'amélioration des compétences des agents et la standardisation des bonnes pratiques."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Réduction significative du temps de formation initiale et d'accompagnement par les superviseurs, accélération de la montée en compétence."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 5,
        "description": "Impact très positif sur la confiance et la satisfaction des agents, particulièrement les nouveaux, avec réduction du stress lié aux premières interactions."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 3,
        "description": "Amélioration modérée de la conformité via la standardisation des procédures et la vérification systématique des connaissances réglementaires."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 5,
        "description": "Technologies avancées de simulation conversationnelle et d'évaluation nécessitant une R&D importante et un développement sur mesure."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 4,
        "description": "Développement complexe d'une plateforme dédiée avec création d'une bibliothèque importante de scénarios et intégration aux systèmes de formation."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 2,
        "description": "Risques limités en termes de données personnelles car focalisé sur la simulation et l'entraînement interne."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 3,
        "description": "Nécessité d'un corpus d'entraînement représentatif basé sur des interactions réelles, mais relativement accessible via les systèmes d'enregistrement."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 4,
        "description": "Transformation significative des méthodes de formation nécessitant une redéfinition du rôle des formateurs et une adoption progressive."
      }
    ],
    "totalValueScore": 2300,
    "totalComplexityScore": 1100
  }
];

export default trainingCases;
