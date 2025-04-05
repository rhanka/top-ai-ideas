
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
          <SelectContent align="start" className="max-w-[400px]">
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
                <SelectItem key={rating} value={rating.toString()} className="text-left truncate">
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
        <CardTitle>{title}</CardTitle>
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
                  <span className="font-medium">{totalScore} points</span>
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
