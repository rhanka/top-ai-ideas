
import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueAxisScore, ComplexityAxisScore, LevelDescription } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RatingsTableProps {
  title: string;
  scores: ValueAxisScore[] | ComplexityAxisScore[];
  isValue: boolean;
  isEditing: boolean;
  backgroundColor: string;
  levelDescriptions?: Record<string, LevelDescription[]>;
  onRatingChange: (isValue: boolean, axisId: string, rating: number) => void;
  totalScore?: number;
}

export const RatingsTable: React.FC<RatingsTableProps> = ({
  title,
  scores,
  isValue,
  isEditing,
  backgroundColor,
  levelDescriptions,
  onRatingChange,
  totalScore
}) => {
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
      </div>
    );
  };
  
  const renderRatingDropdown = (axisId: string, currentRating: number) => {
    if (!isEditing) return null;
    
    // Get descriptions for this axis if available
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
              // Find description for this rating
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
  
  // Correctly determine display level based on total score and thresholds
  const getDisplayLevel = (score?: number): number => {
    if (!score) return 0;
    
    // Define the thresholds for each level
    const thresholds = isValue 
      ? [0, 40, 100, 400, 2000] 
      : [0, 50, 100, 250, 1000];
    
    let level = 1;
    
    // Start from level 1 and find the highest level where score exceeds the threshold
    for (let i = 0; i < thresholds.length; i++) {
      if (score > thresholds[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    
    return level;
  };
  
  const displayLevel = getDisplayLevel(totalScore);
  
  return (
    <Card className="shadow-md">
      <CardHeader className={backgroundColor}>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          {totalScore !== undefined && (
            <span className="text-base font-normal bg-white px-3 py-1 rounded-full shadow-sm">
              Score: {totalScore.toLocaleString()} - Niveau {displayLevel}
              {isValue ? (
                <span className="ml-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-lg ${star <= displayLevel ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                  ))}
                </span>
              ) : (
                <span className="ml-2">
                  {[1, 2, 3, 4, 5].map(x => (
                    <span key={x} className={`font-bold ml-1 ${x <= displayLevel ? "text-gray-800" : "text-gray-300"}`}>X</span>
                  ))}
                </span>
              )}
            </span>
          )}
        </CardTitle>
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
        </Table>
      </CardContent>
    </Card>
  );
};
