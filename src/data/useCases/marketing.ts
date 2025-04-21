import { UseCase } from "@/types";

const marketingCases: UseCase[] = [
  {
    "id": "UC10",
    "name": "Communication Proactive Ciblée (Prévention d'Appels)",
    "domain": "Marketing & Communication",
    "process": "Marketing",
    "description": "Utilisation de modèles d'IA pour analyser les données client (historique, profil, événements récents comme une facture élevée ou une panne signalée) afin d'identifier les clients ayant une forte probabilité d'appeler prochainement. Envoi proactif d'une communication ciblée (SMS, email, notification push) avec des informations pertinentes pour résoudre leur problème potentiel avant même qu'ils ne contactent le service client.",
    "technology": "Machine Learning Prédictif / Marketing Automation",
    "deadline": "2026-Q1",
    "contact": "Nathalie Rousseau - Resp. Communication Client",
    "benefits": [
      "Réduction du volume d'appels entrants estimée à 5-10%",
      "Amélioration de l'expérience client par l'anticipation",
      "Optimisation de la charge des centres de contact",
      "Augmentation de l'utilisation des canaux digitaux",
      "Perception positive de la proactivité de l'entreprise"
    ],
    "metrics": [
      "Précision des prédictions d'appel",
      "Taux de déflection d'appels",
      "Taux d'engagement avec les communications proactives",
      "ROI en réduction de coûts de contact"
    ],
    "risks": [
      "Communications perçues comme intrusives ou inquiétantes",
      "Faux positifs générant de la confusion",
      "Saturation des clients avec trop de communications",
      "Difficultés techniques d'accès aux données en temps opportun"
    ],
    "nextSteps": [
      "Identifier les principaux déclencheurs d'appels",
      "Développer des modèles prédictifs par segment client",
      "Concevoir les templates de communication par typologie",
      "Mettre en place l'infrastructure d'automatisation",
      "Tester avec un groupe pilote avant déploiement complet"
    ],
    "sources": [
      "CRM",
      "Historique des interactions",
      "Système de facturation",
      "Données de monitoring technique",
      "Logs des parcours digitaux"
    ],
    "relatedData": [
      "Profils clients et segments",
      "Historique des communications",
      "Préférences de contact",
      "Données d'utilisation des produits et services"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 3,
        "description": "Soutenu par la Direction Marketing et Service Client qui voient le potentiel d'optimisation des coûts et d'amélioration de l'expérience."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 4,
        "description": "Impact positif significatif sur la perception client grâce à la proactivité et la résolution anticipée de problèmes potentiels."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 5,
        "description": "Réduction importante du volume d'appels simples et prévisibles, permettant des économies substantielles et une meilleure allocation des ressources."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 2,
        "description": "Impact limité sur l'expérience agent, principalement via la réduction de certains appels répétitifs et frustrants."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 4,
        "description": "Amélioration notable de l'image perçue comme une entreprise attentionnée et proactive, avec un impact positif sur la fidélisation."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 4,
        "description": "Modèles prédictifs avancés nécessitant une R&D importante pour atteindre une précision suffisante et limiter les faux positifs."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 4,
        "description": "Intégration complexe avec de multiples systèmes sources et canaux de communication, nécessitant une orchestration sophistiquée."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 4,
        "description": "Utilisation intensive de données client pour des communications ciblées, nécessitant une gestion fine des consentements et préférences."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 4,
        "description": "Nécessité d'accéder et d'analyser en quasi temps réel des données provenant de multiples systèmes pour une proactivité efficace."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 3,
        "description": "Modification modérée des processus de communication client et nécessité de coordination entre équipes marketing et service client."
      }
    ],
    "totalValueScore": 2200,
    "totalComplexityScore": 1000
  }
];

export default marketingCases;
