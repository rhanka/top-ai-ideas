
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose 
} from "@/components/ui/dialog";
import { PlusCircle, Edit, Folder, Trash2, Calendar, File, Building2, X } from "lucide-react";
import { toast } from "sonner";
import { Folder as FolderType } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Folders: React.FC = () => {
  const navigate = useNavigate();
  const { 
    folders, 
    addFolder, 
    updateFolder, 
    deleteFolder, 
    setCurrentFolder, 
    currentFolderId, 
    useCases,
    companies,
    currentCompanyId
  } = useAppContext();
  
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [newFolderDescription, setNewFolderDescription] = useState<string>("");
  
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Le nom du dossier est requis");
      return;
    }
    
    const newFolder = addFolder(newFolderName, newFolderDescription);
    toast.success(`Dossier "${newFolderName}" créé`);
    
    setNewFolderName("");
    setNewFolderDescription("");
    
    setCurrentFolder(newFolder.id);
    navigate('/');
  };
  
  const handleUpdateFolder = () => {
    if (!editingFolder) return;
    
    if (!editingFolder.name.trim()) {
      toast.error("Le nom du dossier est requis");
      return;
    }
    
    updateFolder(editingFolder);
    toast.success(`Dossier "${editingFolder.name}" mis à jour`);
    setEditingFolder(null);
  };
  
  const confirmDeleteFolder = () => {
    if (!folderToDelete) return;
    
    deleteFolder(folderToDelete.id);
    toast.success(`Dossier "${folderToDelete.name}" supprimé`);
    setFolderToDelete(null);
  };
  
  const handleSelectFolder = (folder: FolderType) => {
    setCurrentFolder(folder.id);
    toast.success(`Dossier "${folder.name}" sélectionné`);
    navigate('/cas-usage');
  };
  
  const countUseCasesInFolder = (folderId: string): number => {
    return useCases.filter(useCase => useCase.folderId === folderId).length;
  };
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getCompanyName = (companyId?: string) => {
    if (!companyId) return null;
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : null;
  };
  
  const handleCompanyChange = (companyId: string | null) => {
    if (editingFolder) {
      setEditingFolder({
        ...editingFolder,
        companyId: companyId || undefined
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-navy">Dossiers</h1>
          {currentCompanyId && (
            <div className="flex items-center text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Entreprise active: {getCompanyName(currentCompanyId)}</span>
            </div>
          )}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-navy/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau dossier</DialogTitle>
              <DialogDescription>
                Créez un nouveau dossier pour organiser vos cas d'usage d'IA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nom du dossier</label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Centre d'appel - Projet 2025"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Description du contenu de ce dossier..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleCreateFolder} className="bg-navy hover:bg-navy/90">
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {folders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun dossier</h3>
          <p className="text-gray-500 mb-6">Créez votre premier dossier pour organiser vos cas d'usage d'IA</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Card 
              key={folder.id} 
              className={`shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                folder.id === currentFolderId ? 'border-2 border-navy' : ''
              }`}
              onClick={() => handleSelectFolder(folder)}
            >
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                <CardTitle className="text-navy text-xl flex items-center">
                  <Folder className="mr-2 h-5 w-5" />
                  <span className="truncate">{folder.name}</span>
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {folder.createdAt instanceof Date 
                      ? formatDate(folder.createdAt)
                      : formatDate(new Date(folder.createdAt))}
                  </div>
                  {folder.companyId && (
                    <div className="flex items-center text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {getCompanyName(folder.companyId)}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description:</p>
                  <p className="text-sm line-clamp-3">{folder.description || "Aucune description"}</p>
                </div>
                
                <div className="flex items-center mb-4 text-gray-600">
                  <File className="h-4 w-4 mr-2" />
                  <span><strong>{countUseCasesInFolder(folder.id)}</strong> cas d'usage</span>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolder(folder);
                    }} 
                    variant="outline" 
                    size="icon"
                    className="flex-1 mr-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-500 hover:bg-red-50 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToDelete(folder);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le dossier</DialogTitle>
          </DialogHeader>
          {editingFolder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Nom du dossier</label>
                <Input
                  id="edit-name"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="edit-description"
                  value={editingFolder.description}
                  onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">Entreprise associée</label>
                <div className="flex items-center space-x-2">
                  <Select
                    value={editingFolder.companyId}
                    onValueChange={(value) => handleCompanyChange(value || null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingFolder.companyId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCompanyChange(null)}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFolder(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateFolder} className="bg-navy hover:bg-navy/90">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le dossier "{folderToDelete?.name}" ?
              <br />
              Cette action supprimera également tous les cas d'usage associés et est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFolderToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFolder}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Folders;
