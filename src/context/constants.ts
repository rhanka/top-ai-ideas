// API key storage key
export const OPENAI_API_KEY = 'topai-openai-key';

// Concurrency settings
export const OPENAI_CONCURRENCY = 'topai-openai-concurrency';
export const DEFAULT_CONCURRENCY = 5;

// Prompt storage keys
export const USE_CASE_LIST_PROMPT = 'topai-usecase-list-prompt';
export const USE_CASE_DETAIL_PROMPT = 'topai-usecase-detail-prompt';
export const FOLDER_NAME_PROMPT = 'topai-folder-name-prompt';
export const COMPANY_INFO_PROMPT = 'topai-company-info-prompt';

// Default prompts
export const DEFAULT_USE_CASE_LIST_PROMPT = `En tant qu'expert en innovation d'entreprise, génère une liste de 5 à 10 cas d'usage d'intelligence artificielle pour l'entreprise ou le secteur décrit ci-dessous. Sois spécifique, réaliste et oriente les cas d'usage vers des problèmes métiers concrets.

Voici la description de l'entreprise ou du secteur:
{{user_input}}

Réponds uniquement avec une liste numérotée de cas d'usage, un par ligne, sans autre commentaire.`;

export const DEFAULT_USE_CASE_DETAIL_PROMPT = `En tant qu'expert en intelligence artificielle, détaille le cas d'usage suivant pour une entreprise. Fournis une description complète, les technologies à utiliser, les bénéfices attendus, les risques potentiels et les prochaines étapes.

Cas d'usage:
{{use_case}}

Contexte de l'entreprise ou du secteur:
{{user_input}}

Matrice valeur/complexité:
{{matrix}}

Réponds avec un format JSON contenant les champs suivants: name, domain, description, technology, deadline, contact, benefits (liste), metrics (liste), risks (liste), nextSteps (liste), sources (liste), relatedData (liste), valueScores (liste), complexityScores (liste).`;

export const DEFAULT_FOLDER_NAME_PROMPT = `En tant qu'expert en organisation de l'information, génère un nom de dossier et une courte description pour organiser des cas d'usage liés à l'entrée utilisateur suivante.

Voici l'entrée utilisateur:
{{user_input}}

Réponds avec un format JSON contenant les champs "name" et "description".`;

export const DEFAULT_COMPANY_INFO_PROMPT = `En tant qu'analyste d'entreprise, récupère et structure les informations clés de l'entreprise suivante.

Nom de l'entreprise:
{{company_name}}

Réponds avec un format JSON contenant les champs: name, industry, size, products, processes, challenges, objectives, technologies.`;

// Model storage keys
export const USE_CASE_LIST_MODEL = 'topai-usecase-list-model';
export const USE_CASE_DETAIL_MODEL = 'topai-usecase-detail-model';
export const FOLDER_NAME_MODEL = 'topai-folder-name-model';
export const COMPANY_INFO_MODEL = 'topai-company-info-model';

// Default models
export const DEFAULT_LIST_MODEL = "gpt-3.5-turbo-1106";
export const DEFAULT_DETAIL_MODEL = "gpt-3.5-turbo-1106";
export const DEFAULT_FOLDER_MODEL = "gpt-3.5-turbo-1106";
export const DEFAULT_COMPANY_INFO_MODEL = "gpt-3.5-turbo-1106";

// Available OpenAI models
export const OPENAI_MODELS = [
    { label: "GPT 3.5 Turbo", value: "gpt-3.5-turbo-1106" },
    { label: "GPT 4", value: "gpt-4" },
    { label: "GPT 4 Turbo", value: "gpt-4-turbo-preview" }
];
