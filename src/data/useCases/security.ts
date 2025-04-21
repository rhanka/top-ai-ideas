import { UseCase } from "@/types";

const securityCases: UseCase[] = [
  {
    "id": "UC08",
    "name": "Qualification Appels Urgents (Crise/Panne)",
    "domain": "Gestion des Crises",
    "process": "Sécurité",
    "description": "Lors d'événements majeurs (panne générale, crise sanitaire, etc.) générant un pic d'appels, mise en place d'un SVI intelligent capable d'identifier rapidement la nature de l'appel. Il priorise les appels réellement urgents (ex: sécurité, situation critique) vers les agents et dévie les autres en leur fournissant des informations contextuelles (statut de la panne, consignes) ou en les orientant vers des canaux alternatifs.",
    "technology": "NLP / IA Décisionnelle / Speech Analytics",
    "deadline": "2025-Q3",
    "contact": "Richard Lefort - Dir. Gestion de Crise",
    "benefits": [
      "Gestion optimisée des pics d'appels lors des crises",
      "Traitement prioritaire des situations critiques",
      "Information proactive réduisant le besoin d'appeler",
      "Réduction de l'impact des crises sur la satisfaction client",
      "Amélioration des conditions de travail en situation de crise"
    ],
    "metrics": [
      "Précision de détection des appels urgents",
      "Temps d'attente des appels critiques vs non-critiques",
      "Taux de résolution par canaux alternatifs",
      "Satisfaction client en période de crise"
    ],
    "risks": [
      "Erreurs de qualification dans des cas limites",
      "Frustration des clients déviés en période de stress",
      "Capacité du système à gérer des volumes extrêmes",
      "Adéquation des canaux alternatifs en période de crise"
    ],
    "nextSteps": [
      "Définir les critères précis de qualification d'urgence",
      "Concevoir les arbres de décision et messages de crise",
      "Développer l'intégration avec le système téléphonique",
      "Tester le système en simulation de crise",
      "Former les équipes de gestion de crise à l'utilisation"
    ],
    "sources": [
      "Historique des appels en période de crise",
      "Base de données incidents et pannes",
      "CRM",
      "Systèmes de monitoring technique"
    ],
    "relatedData": [
      "Données géographiques des incidents",
      "Historique des communications de crise",
      "Données de trafic par canal",
      "Procédures d'escalade et gestion de crise"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 5,
        "description": "Soutien au plus haut niveau (Comité Exécutif) en raison de l'importance stratégique de la gestion des crises pour l'image de l'entreprise."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 5,
        "description": "Impact majeur sur la satisfaction client en période critique, où la gestion efficace des crises peut transformer une expérience négative en perception positive."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Optimisation significative des ressources en période de crise, permettant de traiter jusqu'à 3 fois plus d'appels critiques avec les mêmes effectifs."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 4,
        "description": "Réduction considérable du stress agent en période de crise en filtrant les appels et en fournissant des informations contextuelles précieuses."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 5,
        "description": "Impact très positif sur l'image publique grâce à une gestion professionnelle des crises et à la priorisation des situations critiques."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 4,
        "description": "Technologies de qualification avancées nécessitant une fiabilité exceptionnelle dans des contextes de crise où la marge d'erreur est minimale."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 4,
        "description": "Intégration complexe avec les systèmes téléphoniques, les outils de monitoring et les plateformes de communication multi-canal."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 3,
        "description": "Utilisation de données client standard mais avec des enjeux de transparence importants sur les critères de priorisation en situation de crise."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 4,
        "description": "Nécessité d'accéder en temps réel à des données sur l'état des incidents et d'intégrer rapidement des informations évolutives sur les crises en cours."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 5,
        "description": "Transformation majeure des protocoles de gestion de crise nécessitant une refonte des procédures et une formation approfondie des équipes concernées."
      }
    ],
    "totalValueScore": 3600,
    "totalComplexityScore": 1200
  },
  {
    "id": "UC12",
    "name": "Détection Anomalies & Fraude Potentielle",
    "domain": "Sécurité & Conformité",
    "process": "Sécurité",
    "description": "Application de techniques d'IA (machine learning) pour analyser en continu les données transactionnelles, les logs d'accès et les comportements utilisateurs (clients ou agents) afin de détecter des schémas inhabituels ou suspects pouvant indiquer une tentative de fraude, une faille de sécurité ou un abus. Génération d'alertes pour investigation.",
    "technology": "Machine Learning / Détection d'anomalies / Analyse comportementale",
    "deadline": "2025-Q3",
    "contact": "François Dubois - RSSI",
    "benefits": [
      "Détection précoce des tentatives de fraude",
      "Réduction des pertes financières liées aux fraudes",
      "Protection renforcée des données sensibles",
      "Conformité accrue avec les réglementations",
      "Limitation de l'impact réputationnel des incidents"
    ],
    "metrics": [
      "Taux de détection des fraudes connues",
      "Taux de faux positifs",
      "Délai moyen de détection",
      "Économies réalisées (fraudes évitées)"
    ],
    "risks": [
      "Faux positifs générant des investigations inutiles",
      "Complexité technique de détection des nouveaux types de fraude",
      "Évolution constante des techniques frauduleuses",
      "Gestion du volume d'alertes générées"
    ],
    "nextSteps": [
      "Cartographier les typologies de fraudes connues",
      "Collecter et préparer les datasets d'entraînement",
      "Développer les modèles de détection par catégorie",
      "Créer un système de priorisation des alertes",
      "Mettre en place les processus d'investigation"
    ],
    "sources": [
      "Logs de transactions",
      "Historique des cas de fraude",
      "Logs d'accès système",
      "Données comportementales utilisateurs",
      "Rapports d'incidents de sécurité"
    ],
    "relatedData": [
      "Profils de risque client",
      "Patterns de fraude connus",
      "Données d'authentification",
      "Géolocalisation des accès",
      "Comportements typiques par segment"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 5,
        "description": "Soutien au plus haut niveau (Comité Exécutif et Direction Sécurité) en raison des enjeux financiers et réputationnels critiques."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 3,
        "description": "Impact modéré via la protection des clients contre la fraude, mais potentiellement négatif en cas de faux positifs bloquant des transactions légitimes."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Automatisation significative de la détection préliminaire d'anomalies permettant aux analystes sécurité de se concentrer sur les cas pertinents."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 2,
        "description": "Impact limité sur l'expérience agent standard, mais amélioration notable pour les équipes de sécurité et conformité."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 5,
        "description": "Renforcement majeur de la conformité réglementaire et protection significative de l'image de l'entreprise contre les incidents de sécurité."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 4,
        "description": "Technologies avancées de détection d'anomalies nécessitant une R&D importante pour limiter les faux positifs tout en maximisant la détection."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 4,
        "description": "Intégration complexe avec de multiples systèmes sources et développement d'une plateforme sophistiquée d'alerte et investigation."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 5,
        "description": "Enjeux majeurs de protection des données, transparence des décisions et respect des droits des personnes lors des investigations."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 4,
        "description": "Nécessité d'accéder à des volumes importants de données historiques et en temps réel, dispersées dans de multiples systèmes sécurisés."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 3,
        "description": "Adaptation modérée des processus de sécurité existants nécessitant une formation des analystes aux nouveaux outils."
      }
    ],
    "totalValueScore": 2800,
    "totalComplexityScore": 1300
  }
];

export default securityCases;
