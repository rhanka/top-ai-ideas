import { BusinessConfiguration } from '@/types/business';

export const defaultBusinessConfig: BusinessConfiguration = {
  sectors: [
    { id: 'mining', name: 'Mines et ressources', description: 'Extraction et traitement des ressources naturelles' },
    { id: 'energy', name: 'Énergie', description: 'Production et distribution d\'énergie' },
    { id: 'manufacturing', name: 'Fabrication', description: 'Production industrielle et manufacturière' },
    { id: 'transportation', name: 'Transport', description: 'Transport et logistique' },
    { id: 'construction', name: 'Construction', description: 'Construction et infrastructures' },
    { id: 'retail', name: 'Commerce de détail', description: 'Vente au détail et distribution' },
    { id: 'finance', name: 'Services financiers', description: 'Banque, assurance et services financiers' },
    { id: 'healthcare', name: 'Santé', description: 'Soins de santé et services médicaux' },
    { id: 'technology', name: 'Technologies', description: 'Technologies de l\'information et services numériques' },
  ],
  processes: [
    { id: 'call_handling', name: 'Gestion des appels', description: 'Réception et traitement des appels entrants' },
    { id: 'quality_monitoring', name: 'Suivi qualité', description: 'Contrôle et amélioration de la qualité des appels' },
    { id: 'customer_support', name: 'Support client', description: 'Résolution des problèmes et assistance clients' },
    { id: 'call_routing', name: 'Routage des appels', description: 'Distribution et acheminement des appels' },
    { id: 'agent_training', name: 'Formation des agents', description: 'Formation et développement des compétences' },
    { id: 'workforce_management', name: 'Gestion des effectifs', description: 'Planification et gestion des équipes' },
    { id: 'reporting', name: 'Reporting', description: 'Analyse et rapports de performance' },
    { id: 'complaint_handling', name: 'Gestion des réclamations', description: 'Traitement des plaintes et litiges' },
    { id: 'outbound_campaigns', name: 'Campagnes sortantes', description: 'Gestion des campagnes d\'appels sortants' },
    { id: 'knowledge_management', name: 'Gestion des connaissances', description: 'Base de connaissances et procédures' },
  ]
};
