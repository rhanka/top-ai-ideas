
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LevelDescription } from "@/types";
import { Edit, Save } from "lucide-react";

interface LevelDescriptionEditorProps {
  level: number;
  currentDescription: string;
  onSave: (level: number, description: string) => void;
}

export const LevelDescriptionEditor: React.FC<LevelDescriptionEditorProps> = ({
  level,
  currentDescription,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(currentDescription);
  
  const handleSave = () => {
    onSave(level, description);
    setIsEditing(false);
  };
  
  return (
    <div className="relative">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setDescription(currentDescription);
                setIsEditing(false);
              }}
              size="sm"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" /> Enregistrer
            </Button>
          </div>
        </div>
      ) : (
        <div className="group relative">
          <div className="whitespace-pre-line">{description}</div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
