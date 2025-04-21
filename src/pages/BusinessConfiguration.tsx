
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { defaultBusinessConfig } from '@/data/defaultBusinessConfig';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const BusinessConfiguration = () => {
  const [sectors, setSectors] = useState(defaultBusinessConfig.sectors);
  const [processes, setProcesses] = useState(defaultBusinessConfig.processes);
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [editingProcess, setEditingProcess] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEdit = (id: string, type: 'sector' | 'process', value: string) => {
    if (type === 'sector') {
      setSectors(sectors.map(sector => 
        sector.id === id ? { ...sector, name: value } : sector
      ));
    } else {
      setProcesses(processes.map(process => 
        process.id === id ? { ...process, name: value } : process
      ));
    }
  };

  const handleDelete = (id: string, type: 'sector' | 'process') => {
    if (type === 'sector') {
      setSectors(sectors.filter(sector => sector.id !== id));
      toast({
        title: "Secteur supprimé",
        description: "Le secteur a été supprimé avec succès",
      });
    } else {
      setProcesses(processes.filter(process => process.id !== id));
      toast({
        title: "Processus supprimé",
        description: "Le processus a été supprimé avec succès",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Secteurs et Processus</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Sectors Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Secteurs</CardTitle>
                <CardDescription>Liste des secteurs d'activité disponibles</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">
                      {editingSector === sector.id ? (
                        <Input
                          value={sector.name}
                          onChange={(e) => handleEdit(sector.id, 'sector', e.target.value)}
                          onBlur={() => setEditingSector(null)}
                          autoFocus
                        />
                      ) : (
                        sector.name
                      )}
                    </TableCell>
                    <TableCell>{sector.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSector(sector.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sector.id, 'sector')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Processes Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Processus</CardTitle>
                <CardDescription>Liste des processus disponibles</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">
                      {editingProcess === process.id ? (
                        <Input
                          value={process.name}
                          onChange={(e) => handleEdit(process.id, 'process', e.target.value)}
                          onBlur={() => setEditingProcess(null)}
                          autoFocus
                        />
                      ) : (
                        process.name
                      )}
                    </TableCell>
                    <TableCell>{process.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProcess(process.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(process.id, 'process')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessConfiguration;
