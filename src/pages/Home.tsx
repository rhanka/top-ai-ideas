
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Home: React.FC = () => {
  const { currentInput, setCurrentInput, generateUseCases, isGenerating } = useAppContext();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a persistent toast that we'll update during the generation process
    const toastId = toast.loading("Préparation de la génération des cas d'usage...", {
      duration: Infinity, // Keep toast visible until we dismiss it
      position: "bottom-right",
    });
    
    try {
      // Pass the toast ID to the generate function so it can update the toast
      await generateUseCases(toastId);
      
      // Only navigate if generation completed successfully
      if (!isGenerating) {
        // Update toast to success state before navigating
        toast.success("Génération terminée avec succès!", { 
          id: toastId,
          duration: 3000,
        });
        navigate('/cas-usage');
      }
    } catch (error) {
      // Handle any errors
      toast.error(`Erreur lors de la génération: ${error instanceof Error ? error.message : "Erreur inconnue"}`, {
        id: toastId,
        duration: 5000,
      });
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
            <h3 className="font-medium mb-2">Générez des cas d'usage</h3>
            <p className="text-gray-600 text-sm">Notre outil créera des cas d'usage pertinents basés sur votre description.</p>
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
