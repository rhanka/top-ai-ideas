// OpenAI API Key
export const OPENAI_API_KEY = "openai_api_key";

// Prompts in Local Storage
export const USE_CASE_LIST_PROMPT = "use_case_list_prompt";
export const USE_CASE_DETAIL_PROMPT = "use_case_detail_prompt";
export const FOLDER_NAME_PROMPT = "folder_name_prompt";
export const COMPANY_INFO_PROMPT = "company_info_prompt";

// Models in Local Storage
export const USE_CASE_LIST_MODEL = "use_case_list_model";
export const USE_CASE_DETAIL_MODEL = "use_case_detail_model";
export const FOLDER_NAME_MODEL = "folder_name_model";
export const COMPANY_INFO_MODEL = "company_info_model";

// Default Prompts
export const DEFAULT_USE_CASE_LIST_PROMPT = `
Tu es un expert en génération de cas d'usage pour les entreprises. 
À partir de la description de l'activité de l'utilisateur, tu génères une liste de cas d'usage pertinents.
Chaque cas d'usage doit être concis et décrire un problème ou une opportunité spécifique.

Voici la description de l'activité de l'utilisateur:
{{user_input}}

Génère une liste de cas d'usage potentiels (5-10) qui pourraient bénéficier de l'utilisation de nouvelles technologies ou approches.
`;

export const DEFAULT_USE_CASE_DETAIL_PROMPT = `
Tu es un expert en définition de cas d'usage pour les entreprises. 
À partir du nom d'un cas d'usage, de la description de l'activité de l'utilisateur et d'une matrice de valeur/complexité, tu génères une description détaillée du cas d'usage.

Nom du cas d'usage: {{use_case}}
Description de l'activité de l'utilisateur: {{user_input}}
Matrice de valeur/complexité: {{matrix}}

Génère une description détaillée du cas d'usage, incluant les aspects suivants:
- Nom: Nom du cas d'usage
- Domaine: Domaine d'application du cas d'usage
- Description: Description détaillée du cas d'usage
- Technologie: Technologies à utiliser pour ce cas d'usage
- Deadline: Date limite pour la réalisation de ce cas d'usage
- Contact: Personne responsable de ce cas d'usage
- Bénéfices: Bénéfices attendus de la réalisation de ce cas d'usage
- Métriques: Métriques à utiliser pour mesurer le succès de ce cas d'usage
- Risques: Risques associés à la réalisation de ce cas d'usage
- Prochaines étapes: Prochaines étapes à suivre pour la réalisation de ce cas d'usage
- Sources: Sources d'information à utiliser pour la réalisation de ce cas d'usage
- Données liées: Données liées à ce cas d'usage
- valueScores: un tableau de scores de valeur pour chaque axe de la matrice de valeur
- complexityScores: un tableau de scores de complexité pour chaque axe de la matrice de complexité
`;

export const DEFAULT_FOLDER_NAME_PROMPT = `
Tu es un expert en création de noms de dossiers. 
À partir de la description de l'activité de l'utilisateur, tu génères un nom de dossier pertinent et une courte description.

Voici la description de l'activité de l'utilisateur:
{{user_input}}

Génère un nom de dossier pertinent et une courte description au format JSON:
\`\`\`json
{
  "name": "Nom du dossier",
  "description": "Description du dossier"
}
\`\`\`
`;

export const DEFAULT_COMPANY_INFO_PROMPT = `
Tu es un expert en recherche d'informations sur les entreprises.
À partir du nom de l'entreprise, tu recherches des informations pertinentes telles que le secteur d'activité, la taille, les produits/services, etc.

Nom de l'entreprise: {{company_name}}

Retourne les informations de l'entreprise au format JSON:
\`\`\`json
{
  "name": "Nom de l'entreprise",
  "industry": "Secteur d'activité",
  "size": "Taille de l'entreprise",
  "products": "Produits/Services",
  "processes": "Processus clés",
  "challenges": "Défis majeurs",
  "objectives": "Objectifs stratégiques",
  "technologies": "Technologies utilisées"
}
\`\`\`
`;

// Default Models
export const DEFAULT_LIST_MODEL = "gpt-3.5-turbo";
export const DEFAULT_DETAIL_MODEL = "gpt-4-turbo-preview";
export const DEFAULT_FOLDER_MODEL = "gpt-3.5-turbo";
export const DEFAULT_COMPANY_INFO_MODEL = "gpt-3.5-turbo";

// Parallel Requests settings
export const PARALLEL_REQUESTS_LIMIT = "parallel_requests_limit";
export const DEFAULT_PARALLEL_REQUESTS = 3;

// Retry Attempts settings
export const RETRY_ATTEMPTS_LIMIT = "retry_attempts_limit";
export const DEFAULT_RETRY_ATTEMPTS = 3;
