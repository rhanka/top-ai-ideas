
import { UseCase, MatrixConfig, ValueRating, ComplexityRating } from "../types";

// Calculate scores for a use case
export const calcInitialScore = (useCase: UseCase, config: MatrixConfig): UseCase => {
  let totalValue = 0;
  let totalComplexity = 0;
  
  // Calculate value score based on rating points * axis weight
  useCase.valueScores.forEach(score => {
    const axis = config.valueAxes.find(a => a.name === score.axisId);
    if (axis) {
      // Map rating to points based on thresholds
      let points = 0;
      if (config.valueThresholds) {
        const threshold = config.valueThresholds.find(t => t.level === score.rating);
        points = threshold ? threshold.points : 0;
      }
      totalValue += points * axis.weight;
    }
  });
  
  // Calculate complexity score based on rating points * axis weight
  useCase.complexityScores.forEach(score => {
    const axis = config.complexityAxes.find(a => a.name === score.axisId);
    if (axis) {
      // Map rating to points based on thresholds
      let points = 0;
      if (config.complexityThresholds) {
        const threshold = config.complexityThresholds.find(t => t.level === score.rating);
        points = threshold ? threshold.points : 0;
      }
      totalComplexity += points * axis.weight;
    }
  });
  
  return {
    ...useCase,
    totalValueScore: totalValue,
    totalComplexityScore: totalComplexity
  };
};

// Helper function to determine value level based on thresholds
export const getValueLevel = (score: number | undefined, valueThresholds: any[]) => {
  if (score === undefined || !valueThresholds) return 0;
  
  for (let i = valueThresholds.length - 1; i >= 0; i--) {
    const threshold = valueThresholds[i];
    if (score >= threshold.threshold) {
      return threshold.level;
    }
  }
  return 1; // Default minimum level
};

// Helper function to determine complexity level based on thresholds
export const getComplexityLevel = (score: number | undefined, complexityThresholds: any[]) => {
  if (score === undefined || !complexityThresholds) return 0;
  
  for (let i = complexityThresholds.length - 1; i >= 0; i--) {
    const threshold = complexityThresholds[i];
    if (score >= threshold.threshold) {
      return threshold.level;
    }
  }
  return 1; // Default minimum level
};

// Count use cases in a specific level
export const countUseCasesInLevel = (
  useCases: UseCase[],
  valueThresholds: any[],
  complexityThresholds: any[],
  isValue: boolean,
  level: number
): number => {
  return useCases.filter(useCase => {
    if (isValue) {
      return getValueLevel(useCase.totalValueScore, valueThresholds) === level;
    } else {
      return getComplexityLevel(useCase.totalComplexityScore, complexityThresholds) === level;
    }
  }).length;
};
