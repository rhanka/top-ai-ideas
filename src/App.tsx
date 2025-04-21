
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "@/context/AppContext";
import MainNavigation from "@/components/MainNavigation";

import Home from "@/pages/Home";
import Matrix from "@/pages/Matrix";
import UseCaseList from "@/pages/UseCaseList";
import UseCaseDetail from "@/pages/UseCaseDetail";
import Dashboard from "@/pages/Dashboard";
import DataTable from "@/pages/DataTable";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Folders from "@/pages/Folders";
import Companies from "@/pages/Companies";
import CompanyView from "@/pages/CompanyView";
import BusinessConfiguration from "@/pages/BusinessConfiguration";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <MainNavigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/matrice" element={<Matrix />} />
                  <Route path="/cas-usage" element={<UseCaseList />} />
                  <Route path="/cas-usage/:id" element={<UseCaseDetail />} />
                  <Route path="/dossiers" element={<Folders />} />
                  <Route path="/entreprises" element={<Companies />} />
                  <Route path="/entreprises/:id" element={<CompanyView />} />
                  <Route path="/configuration-metier" element={<BusinessConfiguration />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/donnees" element={<DataTable />} />
                  <Route path="/parametres" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
