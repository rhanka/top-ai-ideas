
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const Home: React.FC = () => {
  const { currentInput, setCurrentInput, generateUseCases, isGenerating, addFolder, setCurrentFolder, currentFolderId } = useAppContext();
  const navigate = useNavigate();
  
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [createNewFolder, setCreateNewFolder] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentFolderId && !createNewFolder) {
      toast.error("Aucun dossier sélectionné. Veuillez créer un nouveau dossier.");
      return;
    }
    
    // Si l'utilisateur souhaite créer un nouveau dossier, afficher la boîte de dialogue
    if (createNewFolder) {
      setShowNewFolderDialog(true);
    } else {
      // Sinon, générer directement les cas d'usage dans le dossier actuel
      await generateUseCases();
      
      // Naviguer vers la liste des cas d'usage
      if (!isGenerating) {
        navigate('/cas-usage');
      }
    }
  };
  
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Veuillez saisir un nom de dossier");
      return;
    }
    
    // Créer le nouveau dossier
    const newFolder = addFolder(folderName, folderDescription);
    
    // Définir le nouveau dossier comme dossier actif
    setCurrentFolder(newFolder.id);
    
    // Fermer la boîte de dialogue
    setShowNewFolderDialog(false);
    
    // Générer les cas d'usage pour ce nouveau dossier
    await generateUseCases();
    
    // Naviguer vers la liste des cas d'usage
    if (!isGenerating) {
      navigate('/cas-usage');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 text-navy">
          Générateur de cas d'usage en Intelligence Artificielle
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Décrivez votre activité et le domaine d'IA que vous souhaitez explorer pour générer des idées de cas d'usage pertinents.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="activity" className="block text-lg font-medium text-gray-700">
              Votre activité et vos besoins en IA
            </label>
            <Textarea
              id="activity"
              placeholder="Par exemple: Nous sommes une entreprise de service client qui souhaite améliorer l'expérience client via des solutions d'IA conversationnelle..."
              className="min-h-[200px] text-base"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              required
              disabled={isGenerating}
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="createNewFolder" 
              checked={createNewFolder} 
              onCheckedChange={(checked) => setCreateNewFolder(checked === true)}
            />
            <label
              htmlFor="createNewFolder"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Créer un nouveau dossier
            </label>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              type="submit" 
              className="bg-navy hover:bg-navy/90 text-white px-6 py-6 text-lg rounded-md flex items-center"
              disabled={currentInput.trim().length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  Générer vos cas d'usage
                  <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-navy">Comment ça fonctionne</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center mb-3">
              <span className="text-navy font-bold">1</span>
            </div>
            <h3 className="font-medium mb-2">Décrivez votre activité</h3>
            <p className="text-gray-600 text-sm">Entrez les détails de votre secteur et vos objectifs en matière d'IA.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center mb-3">
              <span className="text-navy font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">Créez un dossier</h3>
            <p className="text-gray-600 text-sm">Organisez vos cas d'usage dans un dossier dédié avec sa propre matrice.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center mb-3">
              <span className="text-navy font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Évaluez et affinez</h3>
            <p className="text-gray-600 text-sm">Utilisez notre matrice valeur/complexité pour prioriser et évaluer vos cas d'usage.</p>
          </div>
        </div>
      </div>
      
      {/* Boîte de dialogue pour créer un nouveau dossier */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre dossier pour regrouper les cas d'usage qui vont être générés.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="folder-name" className="text-sm font-medium">Nom du dossier</label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Centre d'appel - Projet 2025"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="folder-description" className="text-sm font-medium">Description (optionnelle)</label>
              <Textarea
                id="folder-description"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder="Description du contenu de ce dossier..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewFolderDialog(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              className="bg-navy hover:bg-navy/90"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  Créer et générer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
