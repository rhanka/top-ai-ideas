
import React from "react";
import { Table, TableBody, TableCell, TableRow, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueAxisScore, ComplexityAxisScore, LevelDescription } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";

interface RatingsTableProps {
  title: string;
  scores: ValueAxisScore[] | ComplexityAxisScore[];
  isValue: boolean;
  isEditing: boolean;
  backgroundColor: string;
  levelDescriptions?: Record<string, LevelDescription[]>;
  onRatingChange: (isValue: boolean, axisId: string, rating: number) => void;
  totalScore?: number;
  level?: number;
}

export const RatingsTable: React.FC<RatingsTableProps> = ({
  title,
  scores,
  isValue,
  isEditing,
  backgroundColor,
  levelDescriptions,
  onRatingChange,
  totalScore,
  level
}) => {
  const { matrixConfig } = useAppContext();
  
  const getPointsForRating = (rating: number): number => {
    if (isValue && matrixConfig.valueThresholds) {
      const threshold = matrixConfig.valueThresholds.find(t => t.level === rating);
      return threshold ? threshold.points : 0;
    } else if (!isValue && matrixConfig.complexityThresholds) {
      const threshold = matrixConfig.complexityThresholds.find(t => t.level === rating);
      return threshold ? threshold.points : 0;
    }
    return 0;
  };

  const getWeightForAxis = (axisId: string): number => {
    if (isValue) {
      const axis = matrixConfig.valueAxes.find(a => a.name === axisId);
      return axis ? axis.weight : 1;
    } else {
      const axis = matrixConfig.complexityAxes.find(a => a.name === axisId);
      return axis ? axis.weight : 1;
    }
  };

  const getWeightedPoints = (axisId: string, rating: number): number => {
    const points = getPointsForRating(rating);
    const weight = getWeightForAxis(axisId);
    return points * weight;
  };

  const renderRatingSymbols = (axisId: string, rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => isEditing && onRatingChange(isValue, axisId, level)}
            disabled={!isEditing}
            className={`text-xl ${isValue ? "text-2xl" : "font-bold mx-1"} ${
              level <= rating 
                ? isValue ? "text-yellow-500" : "text-gray-800" 
                : "text-gray-300"
            } ${isEditing ? "cursor-pointer hover:" + (isValue ? "text-yellow-400" : "text-gray-600") : "cursor-default"}`}
          >
            {isValue ? "★" : "X"}
          </button>
        ))}
        {!isEditing && (
          <span className="ml-2 text-sm text-gray-500">
            ({getPointsForRating(rating)} pts × {getWeightForAxis(axisId)} = {getWeightedPoints(axisId, rating)} pts)
          </span>
        )}
      </div>
    );
  };
  
  const renderRatingDropdown = (axisId: string, currentRating: number) => {
    if (!isEditing) return null;
    
    const axisLevelDescriptions = levelDescriptions?.[axisId];
    
    return (
      <div className="mt-1 mb-2">
        <Select
          value={currentRating.toString()}
          onValueChange={(value) => onRatingChange(isValue, axisId, parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isValue ? "Sélectionner une note" : "Sélectionner un niveau"} />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((rating) => {
              let ratingDescription = "";
              if (axisLevelDescriptions) {
                const levelDesc = axisLevelDescriptions.find(level => level.level === rating);
                ratingDescription = levelDesc ? levelDesc.description : `Niveau ${rating}`;
              } else {
                ratingDescription = `Niveau ${rating}`;
              }
              
              return (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} - {ratingDescription}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderLevelSymbols = () => {
    if (!level) return null;
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`${isValue ? "text-2xl" : "font-bold mx-1 text-xl"} ${
              i <= level 
                ? isValue ? "text-yellow-500" : "text-gray-800" 
                : "text-gray-300"
            }`}
          >
            {isValue ? "★" : "X"}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className={backgroundColor}>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {totalScore !== undefined && level !== undefined && (
            <div className="flex items-center">
              <div className="mr-2">
                {renderLevelSymbols()}
              </div>
              <span className="text-sm font-medium">
                {Math.round(totalScore)} points
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {scores.map((score) => (
              <TableRow key={score.axisId}>
                <TableCell className="font-medium w-1/3">{score.axisId}</TableCell>
                <TableCell className="w-1/4">
                  {renderRatingSymbols(score.axisId, score.rating)}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    renderRatingDropdown(score.axisId, score.rating)
                  ) : (
                    <p className="text-sm">{score.description}</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {totalScore !== undefined && (
            <TableFooter className="border-t">
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell>
                  {renderLevelSymbols()}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{Math.round(totalScore)} points</span>
                  {level && <span className="text-sm ml-2">({level} {isValue ? "étoiles" : "X"})</span>}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};
