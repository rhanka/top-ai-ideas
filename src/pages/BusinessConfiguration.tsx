
import React, { useState } from 'react';
import { useBusinessConfig } from '@/context/hooks/useBusinessConfig';
import { IndustrySector, BusinessProcess } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Plus, Trash, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const BusinessConfiguration: React.FC = () => {
  const {
    sectors,
    processes,
    isLoading,
    addSector,
    updateSector,
    deleteSector,
    addProcess,
    updateProcess,
    deleteProcess,
    resetToDefaults
  } = useBusinessConfig();

  // États pour le dialogue d'ajout/édition
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessDescription, setNewProcessDescription] = useState('');
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);

  // États pour le dialogue de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [itemToDeleteType, setItemToDeleteType] = useState<'sector' | 'process' | null>(null);
  
  // État pour le dialogue de réinitialisation
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Ouvrir le dialogue d'ajout de secteur
  const openAddSectorDialog = () => {
    setNewSectorName('');
    setEditingSectorId(null);
    setSectorDialogOpen(true);
  };

  // Ouvrir le dialogue d'édition de secteur
  const openEditSectorDialog = (sector: IndustrySector) => {
    setNewSectorName(sector.name);
    setEditingSectorId(sector.id);
    setSectorDialogOpen(true);
  };

  // Ouvrir le dialogue d'ajout de processus
  const openAddProcessDialog = () => {
    setNewProcessName('');
    setNewProcessDescription('');
    setEditingProcessId(null);
    setProcessDialogOpen(true);
  };

  // Ouvrir le dialogue d'édition de processus
  const openEditProcessDialog = (process: BusinessProcess) => {
    setNewProcessName(process.name);
    setNewProcessDescription(process.description);
    setEditingProcessId(process.id);
    setProcessDialogOpen(true);
  };

  // Gestionnaire de soumission du secteur
  const handleSectorSubmit = () => {
    if (newSectorName.trim() === '') {
      toast.error('Le nom du secteur ne peut pas être vide');
      return;
    }

    if (editingSectorId) {
      updateSector(editingSectorId, newSectorName);
    } else {
      addSector(newSectorName);
    }

    setSectorDialogOpen(false);
  };

  // Gestionnaire de soumission du processus
  const handleProcessSubmit = () => {
    if (newProcessName.trim() === '') {
      toast.error('Le nom du processus ne peut pas être vide');
      return;
    }

    if (editingProcessId) {
      updateProcess(editingProcessId, newProcessName, newProcessDescription);
    } else {
      addProcess(newProcessName, newProcessDescription);
    }

    setProcessDialogOpen(false);
  };

  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (id: string, type: 'sector' | 'process') => {
    setItemToDeleteId(id);
    setItemToDeleteType(type);
    setDeleteDialogOpen(true);
  };

  // Gestionnaire de confirmation de suppression
  const handleDeleteConfirm = () => {
    if (!itemToDeleteId || !itemToDeleteType) return;

    if (itemToDeleteType === 'sector') {
      deleteSector(itemToDeleteId);
    } else {
      deleteProcess(itemToDeleteId);
    }

    setDeleteDialogOpen(false);
    setItemToDeleteId(null);
    setItemToDeleteType(null);
  };

  // Ouvrir le dialogue de confirmation de réinitialisation
  const openResetDialog = () => {
    setResetDialogOpen(true);
  };

  // Gestionnaire de confirmation de réinitialisation
  const handleResetConfirm = () => {
    resetToDefaults();
    setResetDialogOpen(false);
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Chargement en cours...</div>;
  }

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy">Configuration métier</h1>
        <Button variant="outline" onClick={openResetDialog} className="text-red-600">
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser aux valeurs par défaut
        </Button>
      </div>

      <Tabs defaultValue="sectors" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sectors">Secteurs d'activité</TabsTrigger>
          <TabsTrigger value="processes">Processus métier</TabsTrigger>
        </TabsList>
        
        {/* Onglet Secteurs */}
        <TabsContent value="sectors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liste des secteurs d'activité</h2>
            <Button onClick={openAddSectorDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un secteur
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector) => (
              <Card key={sector.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{sector.name}</CardTitle>
                </CardHeader>
                <CardFooter className="justify-end pt-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditSectorDialog(sector)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(sector.id, 'sector')}>
                    <Trash className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Message d'état vide pour les secteurs */}
          {sectors.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">Aucun secteur d'activité défini</p>
              <Button onClick={openAddSectorDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un premier secteur
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Onglet Processus */}
        <TabsContent value="processes">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liste des processus métier</h2>
            <Button onClick={openAddProcessDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un processus
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processes.map((process) => (
              <Card key={process.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{process.name}</CardTitle>
                  <CardDescription>{process.description}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-end pt-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditProcessDialog(process)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(process.id, 'process')}>
                    <Trash className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Message d'état vide pour les processus */}
          {processes.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">Aucun processus métier défini</p>
              <Button onClick={openAddProcessDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un premier processus
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogue pour ajouter/éditer un secteur */}
      <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSectorId ? 'Modifier le secteur' : 'Ajouter un secteur'}</DialogTitle>
            <DialogDescription>
              {editingSectorId ? 'Modifiez les informations du secteur.' : 'Définissez un nouveau secteur d\'activité.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="sectorName" className="text-sm font-medium">Nom du secteur</label>
              <Input
                id="sectorName"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
                placeholder="ex: Technologies de l'information"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectorDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSectorSubmit}>
              {editingSectorId ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour ajouter/éditer un processus */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProcessId ? 'Modifier le processus' : 'Ajouter un processus'}</DialogTitle>
            <DialogDescription>
              {editingProcessId ? 'Modifiez les informations du processus.' : 'Définissez un nouveau processus métier.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="processName" className="text-sm font-medium">Nom du processus</label>
              <Input
                id="processName"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                placeholder="ex: Service client"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="processDescription" className="text-sm font-medium">Description</label>
              <Textarea
                id="processDescription"
                value={newProcessDescription}
                onChange={(e) => setNewProcessDescription(e.target.value)}
                placeholder="Décrivez ce processus métier..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleProcessSubmit}>
              {editingProcessId ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDeleteType === 'sector' 
                ? 'Supprimer ce secteur d\'activité ?' 
                : 'Supprimer ce processus métier ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDeleteType === 'sector'
                ? 'Cette action ne peut pas être annulée. Ce secteur sera définitivement supprimé.'
                : 'Cette action ne peut pas être annulée. Ce processus sera définitivement supprimé.'}
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

      {/* Dialogue de confirmation de réinitialisation */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser aux valeurs par défaut</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va remplacer tous les secteurs et processus personnalisés par les valeurs par défaut.
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm} className="bg-red-600 hover:bg-red-700">
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessConfiguration;
