
import React from "react";

export const getValueLevel = (score: number | undefined, valueThresholds: any[]) => {
  if (score === undefined || !valueThresholds) return 0;
  
  for (let i = valueThresholds.length - 1; i >= 0; i--) {
    const threshold = valueThresholds[i];
    if (score >= threshold.threshold) {
      return threshold.level;
    }
  }
  return 1;
};

export const getComplexityLevel = (score: number | undefined, complexityThresholds: any[]) => {
  if (score === undefined || !complexityThresholds) return 0;
  
  for (let i = complexityThresholds.length - 1; i >= 0; i--) {
    const threshold = complexityThresholds[i];
    if (score >= threshold.threshold) {
      return threshold.level;
    }
  }
  return 1;
};

export const renderValueRating = (score: number | undefined, valueThresholds: any[]) => {
  if (score === undefined) return "N/A";
  
  const level = getValueLevel(score, valueThresholds);
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-lg ${star <= level ? "text-yellow-500" : "text-gray-300"}`}>
          ★
        </span>
      ))}
    </div>
  );
};

export const renderComplexityRating = (score: number | undefined, complexityThresholds: any[]) => {
  if (score === undefined) return "N/A";
  
  const level = getComplexityLevel(score, complexityThresholds);
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((x) => (
        <span key={x} className={`font-bold ${x <= level ? "text-gray-800" : "text-gray-300"}`}>
          X
        </span>
      ))}
    </div>
  );
};
