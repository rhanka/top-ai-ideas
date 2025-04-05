
import React from "react";
import { Toaster } from "sonner";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="bottom-right" />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Générateur de Cas d'Usage IA</h1>
        <p className="text-xl text-gray-600">
          Un outil pour explorer des solutions d'intelligence artificielle adaptées à votre activité.
        </p>
      </div>
    </div>
  );
};

export default Index;
