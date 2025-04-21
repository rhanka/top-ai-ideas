// Constants for localStorage keys
export const OPENAI_API_KEY = "openai_api_key";
export const USE_CASE_LIST_PROMPT = "use_case_list_prompt";
export const USE_CASE_DETAIL_PROMPT = "use_case_detail_prompt";
export const FOLDER_NAME_PROMPT = "folder_name_prompt";
export const COMPANY_INFO_PROMPT = "company_info_prompt"; // Prompt pour les infos entreprises
export const FOLDERS_STORAGE_KEY = "ai_folders";
export const CURRENT_FOLDER_ID = "current_folder_id";

// Model selection localStorage keys
export const USE_CASE_LIST_MODEL = "use_case_list_model";
export const USE_CASE_DETAIL_MODEL = "use_case_detail_model";
export const FOLDER_NAME_MODEL = "folder_name_model";
export const COMPANY_INFO_MODEL = "company_info_model"; // Modèle pour les infos entreprises

// Default models
export const DEFAULT_LIST_MODEL = "gpt-4o-mini";
export const DEFAULT_DETAIL_MODEL = "gpt-4o-mini";
export const DEFAULT_FOLDER_MODEL = "gpt-4o-mini";
export const DEFAULT_COMPANY_INFO_MODEL = "gpt-4o"; // Modèle par défaut pour infos entreprises

// Available models
export const OPENAI_MODELS = [
  { value: "o3-mini", label: "O3 Mini" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.5-preview", label: "GPT-4.5 Preview" },
];

// Default prompts with placeholders
export const DEFAULT_USE_CASE_LIST_PROMPT = 
`Génère une liste de 5 cas d'usage d'IA innovants pour le domaine suivant: {{user_input}}.
Pour chaque cas d'usage, propose un titre court et explicite.
Format: liste numérotée sans description.`;

export const DEFAULT_USE_CASE_DETAIL_PROMPT = 
`Génère un cas d'usage détaillé pour "{{use_case}}" dans le contexte suivant: {{user_input}}. 
Utilise la matrice valeur/complexité fournie: {{matrix}} pour évaluer chaque axe de valeur et complexité.

Voici les processus métiers associés à prendre en compte: {{business_processes}}

La réponse doit impérativement contenir tous les éléments suivants au format JSON:

{
  "name": "{{use_case}}",
  "description": "Description détaillée du cas d'usage sur 5-10 lignes",
  "businessProcesses": ["ID_PROCESSUS_1", "ID_PROCESSUS_2"],
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

// Default prompt for folder name generation
export const DEFAULT_FOLDER_NAME_PROMPT = 
`Génère un nom et une brève description pour un dossier qui contiendra des cas d'usage d'IA pour le contexte suivant: {{user_input}}.
Le nom doit être court et représentatif du domaine ou secteur d'activité principal.
La description doit expliquer en 1-2 phrases le contenu du dossier.
Format de réponse en JSON:
{
  "name": "Nom du dossier (4-6 mots max)",
  "description": "Description concise du dossier (20-30 mots max)"
}`;

// Default prompt for company info generation
export const DEFAULT_COMPANY_INFO_PROMPT = 
`Recherchez et fournissez des informations complètes sur l'entreprise {{company_name}} dans le secteur {{sector_name}}. 
Retournez les informations UNIQUEMENT au format JSON suivant:
{
  "industry": "Secteur d'activité principal",
  "size": "Taille en nombre d'employés et chiffre d'affaires si disponible",
  "products": "Description détaillée des principaux produits ou services",
  "processes": "Description des processus métier clés",
  "challenges": "Défis principaux auxquels l'entreprise est confrontée actuellement",
  "objectives": "Objectifs stratégiques connus de l'entreprise",
  "technologies": "Technologies ou systèmes d'information déjà utilisés"
}`;

// --- Ajout gestion file et retries ---
export const USE_CASE_MAX_RETRIES = "use_case_max_retries";
export const USE_CASE_PARALLEL_QUEUE = "use_case_parallel_queue";
export const DEFAULT_USE_CASE_MAX_RETRIES = 2;
export const DEFAULT_USE_CASE_PARALLEL_QUEUE = 5;

// --- Ajout stockage des secteurs et processus ---
export const INDUSTRY_SECTORS_STORAGE_KEY = "industry_sectors";
export const BUSINESS_PROCESSES_STORAGE_KEY = "business_processes";

// Liste par défaut des secteurs d'activité
export const DEFAULT_INDUSTRY_SECTORS = [
  { id: "tech", name: "Technologies et informatique" },
  { id: "finance", name: "Finance et assurance" },
  { id: "retail", name: "Commerce et distribution" },
  { id: "health", name: "Santé et pharmaceutique" },
  { id: "manufacturing", name: "Industrie et production" },
  { id: "energy", name: "Énergie et utilities" },
  { id: "telecom", name: "Télécommunications" },
  { id: "transport", name: "Transport et logistique" },
  { id: "education", name: "Éducation et formation" },
  { id: "media", name: "Médias et divertissement" },
  { id: "public", name: "Secteur public et administration" },
  { id: "agriculture", name: "Agriculture et agroalimentaire" },
  { id: "construction", name: "Construction et immobilier" },
  { id: "services", name: "Services professionnels" },
  { id: "tourism", name: "Tourisme et hôtellerie" }
];

// Liste par défaut des processus métier
export const DEFAULT_BUSINESS_PROCESSES = [
  { id: "sales", name: "Ventes", description: "Processus liés à la prospection et à la vente des produits ou services." },
  { id: "marketing", name: "Marketing", description: "Actions de promotion et de communication pour attirer des clients." },
  { id: "customer_service", name: "Service client", description: "Gestion des demandes, réclamations et support aux clients." },
  { id: "hr", name: "Ressources humaines", description: "Recrutement, formation et gestion du personnel." },
  { id: "finance", name: "Finance et comptabilité", description: "Gestion des flux financiers, comptabilité et contrôle de gestion." },
  { id: "procurement", name: "Achats et approvisionnement", description: "Acquisition de biens et services nécessaires à l'activité." },
  { id: "logistics", name: "Logistique et chaîne d'approvisionnement", description: "Transport, stockage et distribution des produits." },
  { id: "production", name: "Production et opérations", description: "Fabrication des produits ou délivrance des services." },
  { id: "rd", name: "Recherche et développement", description: "Innovation et création de nouveaux produits ou services." },
  { id: "it", name: "Systèmes d'information", description: "Gestion des infrastructures et solutions informatiques." },
  { id: "quality", name: "Qualité et conformité", description: "Contrôle qualité et respect des normes et réglementations." },
  { id: "strategy", name: "Stratégie et développement", description: "Définition des orientations stratégiques de l'entreprise." },
  { id: "legal", name: "Juridique", description: "Gestion des aspects légaux et contractuels." },
  { id: "facilities", name: "Gestion des installations", description: "Maintenance et gestion des locaux et équipements." }
];
