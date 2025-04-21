
export type BusinessSector = {
  id: string;
  name: string;
  description: string;
};

export type BusinessProcess = {
  id: string;
  name: string;
  description: string;
};

export const DEFAULT_SECTORS: BusinessSector[] = [
  { id: "tech", name: "Technologies & IT", description: "Entreprises technologiques et services informatiques" },
  { id: "finance", name: "Finance & Assurance", description: "Services financiers, banques et assurances" },
  { id: "retail", name: "Commerce & Distribution", description: "Vente au détail et distribution" },
  { id: "manufacturing", name: "Industrie & Production", description: "Production industrielle et manufacture" },
  { id: "healthcare", name: "Santé & Médical", description: "Services de santé et industries médicales" },
  { id: "services", name: "Services Professionnels", description: "Conseil, audit et services aux entreprises" }
];

export const DEFAULT_PROCESSES: BusinessProcess[] = [
  { id: "sales", name: "Ventes", description: "Processus de vente et acquisition clients" },
  { id: "marketing", name: "Marketing", description: "Promotion et communication" },
  { id: "customer_service", name: "Service Client", description: "Support et relation client" },
  { id: "hr", name: "Ressources Humaines", description: "Gestion du personnel" },
  { id: "finance", name: "Finance", description: "Gestion financière et comptabilité" },
  { id: "operations", name: "Opérations", description: "Gestion des opérations quotidiennes" },
  { id: "it", name: "IT & Systèmes", description: "Gestion des systèmes d'information" },
  { id: "rnd", name: "R&D", description: "Recherche et développement" }
];
