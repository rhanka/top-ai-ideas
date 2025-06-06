
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid, FileText, BarChart, Table, Settings, FolderOpen, Building2, List, Figma } from "lucide-react";
import { cn } from "@/lib/utils";

const MainNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Accueil", path: "/", icon: Home },
    { name: "Dossiers", path: "/dossiers", icon: FolderOpen },
    { name: "Entreprises", path: "/entreprises", icon: Building2 },
    { name: "Secteurs et processus", path: "/configuration-metier", icon: List },
    { name: "Cas d'usage", path: "/cas-usage", icon: FileText },
    { name: "Matrice", path: "/matrice", icon: Grid },
    { name: "Dashboard", path: "/dashboard", icon: BarChart },
    { name: "Design", path: "/design", icon: Figma },
    { name: "Données", path: "/donnees", icon: Table },
    { name: "Paramètres", path: "/parametres", icon: Settings },
  ];
  
  return (
    <nav className="bg-navy text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Top AI Ideas</h1>
        </div>
        
        <div className="flex space-x-1 md:space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm md:text-base transition-colors",
                location.pathname === item.path
                  ? "bg-white text-navy font-medium"
                  : "text-white/80 hover:bg-white/10"
              )}
            >
              <item.icon className="w-5 h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
