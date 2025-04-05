
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPENAI_MODELS } from "@/context/constants";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  label,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Sélectionnez un modèle" />
      </SelectTrigger>
      <SelectContent>
        {OPENAI_MODELS.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default ModelSelector;
