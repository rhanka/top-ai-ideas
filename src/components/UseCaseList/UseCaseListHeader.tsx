
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UseCaseListHeaderProps {
  isMobile: boolean;
  currentFolder: any;
  handleCreateNew: () => void;
}

const UseCaseListHeader: React.FC<UseCaseListHeaderProps> = ({ 
  isMobile, 
  currentFolder, 
  handleCreateNew 
}) => {
  const navigate = useNavigate();
  
  if (isMobile) {
    return (
      <div className="flex flex-col mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-navy">Cas d'usage IA</h1>
          {currentFolder && (
            <p className="text-gray-600 mt-1">
              Dossier: {currentFolder.name}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => navigate('/dossiers')}
            variant="outline" 
            className="w-full"
          >
            <FolderOpen className="mr-2 h-5 w-5" /> Voir les dossiers
          </Button>
          
          <Button 
            onClick={handleCreateNew}
            className="bg-navy hover:bg-navy/90 w-full"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Nouveau cas d'usage
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Cas d'usage IA</h1>
        {currentFolder && (
          <p className="text-gray-600 mt-1">
            Dossier: {currentFolder.name}
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => navigate('/dossiers')}
          variant="outline" 
        >
          <FolderOpen className="mr-2 h-5 w-5" /> Voir les dossiers
        </Button>
        
        <Button 
          onClick={handleCreateNew}
          className="bg-navy hover:bg-navy/90"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Nouveau cas d'usage
        </Button>
      </div>
    </div>
  );
};

export default UseCaseListHeader;
