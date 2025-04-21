
// Value rating types (stars)
export type ValueRating = 1 | 2 | 3 | 4 | 5;

// Complexity rating types (x)
export type ComplexityRating = 1 | 2 | 3 | 4 | 5;

// Level descriptions
export type LevelDescription = {
  level: number;
  description: string;
};

// Level threshold values
export type LevelThreshold = {
  level: number;
  min: number;
  max: number;
  points: number;
  threshold: number;
  cases?: number;
};

// Axis types for the matrix
export type ValueAxis = {
  name: string;
  weight: number;
  description: string;
  levelDescriptions?: LevelDescription[];
};

export type ComplexityAxis = {
  name: string;
  weight: number;
  description: string;
  levelDescriptions?: LevelDescription[];
};

// Value axis scores
export type ValueAxisScore = {
  axisId: string;
  rating: ValueRating;
  description: string;
};

// Complexity axis scores
export type ComplexityAxisScore = {
  axisId: string;
  rating: ComplexityRating;
  description: string;
};

// Company profile type
export type Company = {
  id: string;
  name: string;
  industry: string;
  size: string;
  products: string;
  processes: string;
  challenges: string;
  objectives: string;
  technologies: string;
  createdAt: Date;
  updatedAt: Date;
};

// UseCase type
export type UseCase = {
  id: string;
  name: string;
  process: string; // Changed from domain to process
  description: string;
  technology: string;
  deadline: string;
  contact: string;
  benefits: string[];
  metrics: string[];
  risks: string[];
  nextSteps: string[];
  sources: string[];
  relatedData: string[]; 
  valueScores: ValueAxisScore[];
  complexityScores: ComplexityAxisScore[];
  totalValueScore?: number;
  totalComplexityScore?: number;
  folderId: string;
  companyId?: string;
};

// Matrix configuration
export type MatrixConfig = {
  valueAxes: ValueAxis[];
  complexityAxes: ComplexityAxis[];
  valueThresholds?: LevelThreshold[];
  complexityThresholds?: LevelThreshold[];
};

// Folder type
export type Folder = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  matrixConfig: MatrixConfig;
  companyId?: string;
};
