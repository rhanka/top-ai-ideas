
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ModelSelector from "./ModelSelector";

interface PromptCardProps {
  title: string;
  description: string;
  promptValue: string;
  modelValue: string;
  setPromptValue: (value: string) => void;
  setModelValue: (value: string) => void;
  modelLabel: string;
}

const PromptCard: React.FC<PromptCardProps> = ({
  title,
  description,
  promptValue,
  modelValue,
  setPromptValue,
  setModelValue,
  modelLabel,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder="Entrez votre prompt personnalisé..."
            className="min-h-[150px]"
          />

          <ModelSelector
            value={modelValue}
            onChange={setModelValue}
            label={modelLabel}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
