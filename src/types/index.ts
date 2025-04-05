
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

// UseCase type
export type UseCase = {
  id: string;
  name: string;
  domain: string;
  description: string;
  technology: string;
  deadline: string;
  contact: string;
  benefits: string[];
  metrics: string[];
  risks: string[];
  nextSteps: string[];
  sources: string[];
  relatedData: string[]; // New field for related data (client identity, invoices, call history)
  valueScores: ValueAxisScore[];
  complexityScores: ComplexityAxisScore[];
  totalValueScore?: number;
  totalComplexityScore?: number;
};

// Matrix configuration
export type MatrixConfig = {
  valueAxes: ValueAxis[];
  complexityAxes: ComplexityAxis[];
  valueThresholds?: LevelThreshold[];
  complexityThresholds?: LevelThreshold[];
};
