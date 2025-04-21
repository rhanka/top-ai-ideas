import { UseCase } from "@/types";

const digitalExpCases: UseCase[] = [
  {
    "id": "UC13",
    "name": "Analyse Parcours Client Self-Service (Web/App)",
    "domain": "Expérience Utilisateur",
    "process": "Expérience Digitale",
    "description": "Utilisation de l'IA pour analyser les données de navigation et d'interaction des utilisateurs sur les plateformes self-service (site web, application mobile, espace client), afin d'identifier automatiquement les points de friction, les parcours inefficaces, les pages générant des erreurs ou des abandons, afin d'optimiser l'ergonomie et le contenu pour réduire les appels au support.",
    "technology": "Analytics / Machine Learning / UX Research",
    "deadline": "2025-Q4",
    "contact": "Caroline Martin - Dir. Exp. Digitale",
    "benefits": [
      "Réduction des abandons dans les parcours self-service",
      "Diminution des appels générés par les échecs self-service",
      "Amélioration du taux de conversion des parcours clés",
      "Personnalisation de l'expérience par segment",
      "Optimisation continue basée sur les données"
    ],
    "metrics": [
      "Taux d'achèvement des parcours clés",
      "Réduction des appels post-visite digitale",
      "Temps passé sur les parcours optimisés",
      "Score d'expérience utilisateur (CES)"
    ],
    "risks": [
      "Biais d'interprétation des comportements utilisateur",
      "Difficulté à identifier les causes profondes des abandons",
      "Coût des modifications techniques sur les plateformes",
      "Rotation rapide des standards d'expérience utilisateur"
    ],
    "nextSteps": [
      "Implémenter un système avancé de tracking utilisateur",
      "Définir les KPIs et parcours critiques à optimiser",
      "Développer les modèles d'analyse comportementale",
      "Créer un tableau de bord UX pour les équipes produit",
      "Établir un processus d'amélioration continue"
    ],
    "sources": [
      "Analytics web/mobile",
      "Logs d'utilisation des applications",
      "Enregistrements de sessions utilisateurs",
      "Feedbacks utilisateurs",
      "Données de support post-visite"
    ],
    "relatedData": [
      "Segmentation des utilisateurs",
      "Historique des modifications d'interface",
      "Mesures de performance technique",
      "Données des tests utilisateurs"
    ],
    "valueScores": [
      {
        "axisId": "Niveau de Sponsorship",
        "rating": 3,
        "description": "Soutenu par la Direction de l'Expérience Digitale et la Direction Marketing qui reconnaissent l'importance de l'optimisation des canaux digitaux."
      },
      {
        "axisId": "Impact Satisfaction Client (CSAT/NPS)",
        "rating": 4,
        "description": "Amélioration significative de l'expérience client digitale réduisant les irritants et facilitant l'accomplissement des tâches courantes."
      },
      {
        "axisId": "Gains de Productivité (Agents & Opérations)",
        "rating": 4,
        "description": "Réduction notable des contacts générés par les échecs dans les parcours self-service, estimée à 5-10% du volume d'appels."
      },
      {
        "axisId": "Amélioration Expérience Agent & Rétention",
        "rating": 3,
        "description": "Impact modéré via la réduction des appels de frustration suite à des échecs digitaux, permettant aux agents de se concentrer sur des interactions à valeur ajoutée."
      },
      {
        "axisId": "Conformité & Image Publique",
        "rating": 3,
        "description": "Amélioration modérée de l'image de marque grâce à des interfaces digitales plus intuitives et accessibles."
      }
    ],
    "complexityScores": [
      {
        "axisId": "Maturité & Fiabilité Solution IA",
        "rating": 3,
        "description": "Technologies d'analyse comportementale relativement matures mais nécessitant une adaptation spécifique aux parcours et objectifs de l'entreprise."
      },
      {
        "axisId": "Effort d'Implémentation & Intégration",
        "rating": 3,
        "description": "Intégration modérée avec les plateformes digitales existantes et développement d'outils d'analyse dédiés."
      },
      {
        "axisId": "IA Responsable & Conformité Données",
        "rating": 4,
        "description": "Enjeux importants de consentement et transparence sur la collecte des données de navigation et d'interaction, conformité RGPD stricte requise."
      },
      {
        "axisId": "Disponibilité, Qualité & Accès Données",
        "rating": 3,
        "description": "Données de navigation généralement bien structurées et accessibles via les outils analytics, mais nécessité d'enrichissement pour certaines analyses avancées."
      },
      {
        "axisId": "Gestion du Changement & Impact Métier",
        "rating": 2,
        "description": "Impact limité sur les processus existants, principalement focalisé sur les équipes produit et UX déjà habituées aux approches data-driven."
      }
    ],
    "totalValueScore": 2100,
    "totalComplexityScore": 700
  }
];

export default digitalExpCases;
