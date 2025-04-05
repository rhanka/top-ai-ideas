
import React from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onReset: () => void;
  onSave: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onReset, onSave }) => {
  return (
    <div className="mt-4 flex gap-2 justify-end">
      <Button variant="outline" onClick={onReset} className="flex gap-1">
        <Trash2 size={16} />
        <span>Réinitialiser les prompts</span>
      </Button>
      <Button onClick={onSave} className="flex gap-1">
        <Save size={16} />
        <span>Enregistrer tous les paramètres</span>
      </Button>
    </div>
  );
};

export default ActionButtons;
