import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Building2, Check, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import CompanyForm from '@/components/Company/CompanyForm';
import { useNavigate } from 'react-router-dom';

const Companies: React.FC = () => {
  const { companies, addCompany, updateCompany, deleteCompany, currentCompanyId, setCurrentCompany } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const navigate = useNavigate();
  
  // Gestionnaire pour l'ouverture du formulaire de création
  const handleCreateClick = () => {
    setEditingCompany(null);
    setIsSheetOpen(true);
  };
  
  // Gestionnaire pour l'ouverture du formulaire d'édition
  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setIsSheetOpen(true);
  };
  
  // Gestionnaire pour la confirmation de suppression
  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
  };
  
  // Gestionnaire pour la soumission du formulaire
  const handleFormSubmit = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    
    try {
      if (editingCompany) {
        // Mise à jour d'une entreprise existante
        updateCompany({
          ...editingCompany,
          ...data,
        });
      } else {
        // Création d'une nouvelle entreprise
        addCompany(data);
      }
      
      // Fermeture du dialogue après traitement
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'entreprise:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gestionnaire pour la confirmation de suppression
  const handleDeleteConfirm = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete.id);
      setCompanyToDelete(null);
    }
  };
  
  // Gestionnaire pour définir l'entreprise active
  const handleSetActiveCompany = (companyId: string) => {
    setCurrentCompany(companyId === currentCompanyId ? null : companyId);
  };
  
  // Affichage d'un message si aucune entreprise n'existe
  if (companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy">Entreprises</h1>
          <Button onClick={handleCreateClick} className="bg-navy hover:bg-navy/90">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle entreprise
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucune entreprise</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore créé d'entreprise. Créez votre première entreprise pour générer des cas d'usage personnalisés.
          </p>
          <Button onClick={handleCreateClick} className="bg-navy hover:bg-navy/90">
            <Plus className="w-4 h-4 mr-2" /> Créer une entreprise
          </Button>
        </div>
        
        {/* Sheet pour création/édition (remplace Dialog) */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Nouvelle entreprise</SheetTitle>
              <SheetDescription>
                Créez une nouvelle fiche entreprise pour personnaliser vos cas d'usage.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <CompanyForm
                onSubmit={handleFormSubmit}
                onCancel={() => setIsSheetOpen(false)}
                isSubmitting={isSubmitting}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-navy">Entreprises</h1>
        <Button onClick={handleCreateClick} className="bg-navy hover:bg-navy/90">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle entreprise
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className={`transition-all ${company.id === currentCompanyId ? 'border-navy border-2' : 'hover:shadow-md'}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{company.name}</span>
                {company.id === currentCompanyId && (
                  <span className="bg-navy text-white text-xs px-2 py-1 rounded">Active</span>
                )}
              </CardTitle>
              <CardDescription>{company.industry}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Taille</p>
                <p className="text-sm text-gray-600">{company.size}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Produits/Services</p>
                <p className="text-sm text-gray-600 line-clamp-2">{company.products}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleEditClick(company)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-600" onClick={() => handleDeleteClick(company)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigate(`/entreprises/${company.id}`)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant={company.id === currentCompanyId ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSetActiveCompany(company.id)}
              >
                {company.id === currentCompanyId ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Sélectionnée
                  </>
                ) : (
                  "Sélectionner"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Sheet pour création/édition (remplace Dialog) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingCompany ? "Modifier l'entreprise" : "Nouvelle entreprise"}</SheetTitle>
            <SheetDescription>
              {editingCompany 
                ? "Modifiez les informations de cette entreprise."
                : "Créez une nouvelle fiche entreprise pour personnaliser vos cas d'usage."}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] pr-4">
            <CompanyForm
              initialData={editingCompany || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsSheetOpen(false)}
              isSubmitting={isSubmitting}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'entreprise "{companyToDelete?.name}" ? 
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Companies;
