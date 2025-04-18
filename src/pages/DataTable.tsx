import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Search, FileText, RefreshCw, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UseCase } from "@/types";
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

const DataTable: React.FC = () => {
  const { useCases, deleteUseCase, getCurrentFolder } = useAppContext();
  const navigate = useNavigate();
  
  const currentFolder = getCurrentFolder();
  
  const [sortField, setSortField] = useState<keyof UseCase>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [useCaseToDelete, setUseCaseToDelete] = useState<UseCase | null>(null);
  
  const handleSort = (field: keyof UseCase) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (useCase: UseCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setUseCaseToDelete(useCase);
  };

  const confirmDelete = () => {
    if (useCaseToDelete) {
      deleteUseCase(useCaseToDelete.id);
      toast.success(`Cas d'usage "${useCaseToDelete.name}" supprimé`);
      setUseCaseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setUseCaseToDelete(null);
  };
  
  const sortedData = [...useCases]
    .filter(useCase => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        useCase.id.toLowerCase().includes(query) ||
        useCase.name.toLowerCase().includes(query) ||
        useCase.description.toLowerCase().includes(query) ||
        useCase.domain.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA === undefined || fieldB === undefined) return 0;
      
      let comparison = 0;
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        comparison = fieldA - fieldB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  const exportToCSV = () => {
    const headers = ["ID", "Nom", "Domaine", "Description", "Technologie", "Deadline", "Contact", "Valeur", "Complexité"];
    
    const csvData = useCases.map(useCase => [
      useCase.id,
      `"${useCase.name.replace(/"/g, '""')}"`,
      useCase.domain,
      `"${useCase.description.replace(/"/g, '""')}"`,
      useCase.technology,
      useCase.deadline,
      useCase.contact,
      useCase.totalValueScore,
      useCase.totalComplexityScore
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cas_usage_ia.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderValueRating = (rating: number | undefined) => {
    if (!rating) return "N/A";
    const normalizedRating = Math.min(Math.max(Math.round(rating / 8), 1), 5);
    return "★".repeat(normalizedRating);
  };
  
  const renderComplexityRating = (rating: number | undefined) => {
    if (!rating) return "N/A";
    const normalizedRating = Math.min(Math.max(Math.round(rating / 6), 1), 5);
    return "X".repeat(normalizedRating);
  };
  
  const viewDetails = (id: string) => {
    navigate(`/cas-usage/${id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Données des cas d'usage</h1>
          {currentFolder && (
            <p className="text-gray-600 mt-1">
              Dossier: {currentFolder.name}
            </p>
          )}
        </div>
        
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          
          <Button 
            onClick={exportToCSV}
            className="bg-navy hover:bg-navy/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead 
                  className="w-16 cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Nom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('domain')}
                >
                  <div className="flex items-center">
                    Domaine
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Technologie</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('deadline')}
                >
                  <div className="flex items-center">
                    Délai
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('totalValueScore')}
                >
                  <div className="flex items-center">
                    Valeur
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('totalComplexityScore')}
                >
                  <div className="flex items-center">
                    Complexité
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((useCase) => (
                  <TableRow key={useCase.id}>
                    <TableCell className="font-mono">{useCase.id}</TableCell>
                    <TableCell className="font-medium">{useCase.name}</TableCell>
                    <TableCell>{useCase.domain}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{useCase.description}</TableCell>
                    <TableCell>{useCase.technology}</TableCell>
                    <TableCell>{useCase.deadline}</TableCell>
                    <TableCell className="text-yellow-500">{renderValueRating(useCase.totalValueScore)}</TableCell>
                    <TableCell className="font-bold">{renderComplexityRating(useCase.totalComplexityScore)}</TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewDetails(useCase.id)}
                        title="Voir détails"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(useCase, e)}
                        className="text-red-500 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    Aucun cas d'usage trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={useCaseToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le cas d'usage "{useCaseToDelete?.name}" ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

export default DataTable;
