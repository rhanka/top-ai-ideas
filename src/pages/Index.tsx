
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Toaster } from 'sonner';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-3xl px-4">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Top AI Ideas Logo" className="w-24 h-24" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-navy">
          Générateur de Cas d'Usage en Intelligence Artificielle
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Créez facilement des cas d'usage d'IA pertinents pour votre entreprise et évaluez leur valeur et complexité.
        </p>
        
        <Button 
          onClick={() => navigate('/home')}
          className="bg-navy hover:bg-navy/90 text-white px-6 py-6 text-lg rounded-md flex items-center mx-auto"
        >
          <Sparkles className="w-6 h-6 mr-2" />
          Commencer
        </Button>
      </div>
      
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
};

export default Index;
