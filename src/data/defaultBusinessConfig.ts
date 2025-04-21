
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
    { id: 'operations', name: 'Opérations', description: 'Gestion des opérations quotidiennes' },
    { id: 'maintenance', name: 'Maintenance', description: 'Entretien et maintenance des équipements' },
    { id: 'logistics', name: 'Logistique', description: 'Gestion de la chaîne d\'approvisionnement' },
    { id: 'quality', name: 'Qualité', description: 'Contrôle et assurance qualité' },
    { id: 'hr', name: 'Ressources humaines', description: 'Gestion du personnel' },
    { id: 'finance', name: 'Finance', description: 'Gestion financière' },
    { id: 'sales', name: 'Ventes', description: 'Processus de vente' },
    { id: 'marketing', name: 'Marketing', description: 'Stratégie marketing et communication' },
    { id: 'rd', name: 'R&D', description: 'Recherche et développement' },
    { id: 'it', name: 'IT', description: 'Technologies de l\'information' },
    { id: 'customer_service', name: 'Service client', description: 'Support et service client' },
  ]
};
