
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2, Building2, Plus, Settings } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Home: React.FC = () => {
  const { 
    currentInput, 
    setCurrentInput, 
    generateUseCases, 
    isGenerating, 
    currentFolderId, 
    folders,
    companies,
    currentCompanyId,
    setCurrentCompany,
    getProcessesByIds
  } = useAppContext();
  const navigate = useNavigate();
  
  const [createNewFolder, setCreateNewFolder] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentFolderId && !createNewFolder) {
      toast.error("Aucun dossier sélectionné. Veuillez créer un nouveau dossier ou en sélectionner un existant.");
      return;
    }
    
    // Afficher un toast d'information sur le dossier cible
    if (createNewFolder) {
      toast.info("Génération dans un nouveau dossier en cours...");
    } else if (currentFolderId) {
      const currentFolder = folders.find(f => f.id === currentFolderId);
      toast.info(`Génération dans le dossier "${currentFolder?.name || 'Actuel'}" en cours...`);
    }
    
    const success = await generateUseCases(currentInput, createNewFolder);
    
    // Naviguer vers la liste des cas d'usage si la génération a réussi
    if (success) {
      navigate('/cas-usage');
    }
  };
  
  // Gestionnaire pour la création d'une nouvelle entreprise
  const handleNewCompany = () => {
    navigate('/entreprises');
  };
  
  // Gestionnaire pour la configuration métier
  const handleBusinessConfig = () => {
    navigate('/configuration-metier');
  };
  
  // Gestionnaire pour la sélection d'une entreprise
  const handleCompanyChange = (companyId: string) => {
    if (companyId === "none") {
      setCurrentCompany(null);
    } else {
      setCurrentCompany(companyId);
    }
  };
  
  // Récupérer les processus de l'entreprise actuelle
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const currentProcesses = currentCompany && currentCompany.businessProcesses?.length && getProcessesByIds
    ? getProcessesByIds(currentCompany.businessProcesses)
    : [];

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
          {/* Sélection d'entreprise et config métier */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div className="space-y-2 w-full">
              <label htmlFor="company" className="block text-lg font-medium text-gray-700 flex items-center justify-between">
                <span>Entreprise</span>
                <Button type="button" variant="outline" size="sm" onClick={handleNewCompany} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Nouvelle entreprise
                </Button>
              </label>
              <Select 
                onValueChange={handleCompanyChange} 
                value={currentCompanyId || "none"}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une entreprise (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune entreprise sélectionnée</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Entreprises</SelectLabel>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button type="button" variant="outline" size="sm" onClick={handleBusinessConfig}>
                <Settings className="w-3 h-3 mr-1" />
                Configuration secteurs/processus
              </Button>
            </div>
          </div>
          
          {/* Affichage des processus de l'entreprise sélectionnée */}
          {currentCompany && currentProcesses.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Processus associés à {currentCompany.name}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProcesses.map(process => (
                  <Badge key={process.id} variant="outline">
                    {process.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
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
    </div>
  );
};

export default Home;
