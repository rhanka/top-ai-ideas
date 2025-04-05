
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, FolderOpen } from "lucide-react";

interface EmptyStateProps {
  currentFolder: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({ currentFolder }) => {
  const navigate = useNavigate();
  
  if (!currentFolder) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun dossier sélectionné</h3>
        <p className="text-gray-500 mb-6">Veuillez sélectionner un dossier pour voir ses cas d'usage</p>
        <Button 
          onClick={() => navigate('/dossiers')}
          variant="outline"
        >
          Voir les dossiers
        </Button>
      </div>
    );
  }
  
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg">
      <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun cas d'usage</h3>
      <p className="text-gray-500 mb-6">Ce dossier ne contient aucun cas d'usage. Générez-en depuis la page d'accueil.</p>
      <Button 
        onClick={() => navigate('/')}
        variant="outline"
      >
        Retour à l'accueil
      </Button>
    </div>
  );
};

export default EmptyState;
