
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Company, IndustrySector, BusinessProcess } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchCompanyInfoByName } from '@/services/companyInfoService';
import { useBusinessConfig } from '@/context/hooks/useBusinessConfig';

// Schéma de validation pour le formulaire
const companySchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  sectorId: z.string().min(1, { message: "Le secteur d'activité est requis" }),
  industry: z.string().min(2, { message: "Le secteur d'activité est requis" }),
  size: z.string().min(2, { message: "La taille de l'entreprise est requise" }),
  products: z.string().min(2, { message: "La description des produits/services est requise" }),
  processes: z.string(),
  challenges: z.string(),
  objectives: z.string(),
  technologies: z.string(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: Company;
  onSubmit: (data: CompanyFormValues & { businessProcesses: string[] }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const { sectors, processes } = useBusinessConfig();
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>(initialData?.businessProcesses || []);
  
  // Initialiser le formulaire avec les données existantes ou des valeurs par défaut
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData ? {
      name: initialData.name,
      sectorId: initialData.sectorId || sectors[0]?.id || '',
      industry: initialData.industry,
      size: initialData.size,
      products: initialData.products,
      processes: initialData.processes,
      challenges: initialData.challenges,
      objectives: initialData.objectives,
      technologies: initialData.technologies,
    } : {
      name: '',
      sectorId: sectors[0]?.id || '',
      industry: '',
      size: '',
      products: '',
      processes: '',
      challenges: '',
      objectives: '',
      technologies: '',
    },
  });

  const handleFormSubmit = (data: CompanyFormValues) => {
    onSubmit({ ...data, businessProcesses: selectedProcesses });
  };

  // Fonction pour auto-remplir les détails de l'entreprise
  const handleAutoFill = async () => {
    const companyName = form.getValues("name");
    const sectorId = form.getValues("sectorId");
    
    if (!companyName || companyName.length < 2) {
      toast.error("Veuillez d'abord saisir un nom d'entreprise valide");
      return;
    }

    if (!sectorId) {
      toast.error("Veuillez sélectionner un secteur d'activité");
      return;
    }

    // Récupérer le nom du secteur pour le prompt
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector) {
      toast.error("Secteur d'activité invalide");
      return;
    }
    
    setIsAutoFilling(true);
    
    try {
      const companyInfo = await fetchCompanyInfoByName(companyName, sector.name);
      
      // Mettre à jour tous les champs du formulaire avec les données récupérées
      form.setValue("industry", companyInfo.industry);
      form.setValue("size", companyInfo.size);
      form.setValue("products", companyInfo.products);
      form.setValue("processes", companyInfo.processes);
      form.setValue("challenges", companyInfo.challenges);
      form.setValue("objectives", companyInfo.objectives);
      form.setValue("technologies", companyInfo.technologies);
      
      toast.success("Informations sur l'entreprise récupérées avec succès");
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      toast.error("Impossible de récupérer les informations de l'entreprise", { 
        description: "Veuillez vérifier le nom et réessayer ou remplir manuellement."
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Basculer l'état d'un processus
  const toggleProcess = (processId: string) => {
    setSelectedProcesses(prev => {
      if (prev.includes(processId)) {
        return prev.filter(id => id !== processId);
      } else {
        return [...prev, processId];
      }
    });
  };

  // Compter le nombre de processus sélectionnés
  const selectedCount = selectedProcesses.length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nom de l'entreprise avec bouton auto-remplissage */}
          <div className="relative">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FormControl>
                        <Input placeholder="ex: Acme Inc." {...field} />
                      </FormControl>
                    </div>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={handleAutoFill}
                      disabled={isAutoFilling || !field.value || field.value.length < 2}
                    >
                      {isAutoFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormDescription>
                    Saisissez un nom et utilisez le bouton pour auto-remplir les informations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Secteur d'activité (dropdown) */}
          <FormField
            control={form.control}
            name="sectorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industrie plus détaillée */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industrie spécifique</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Édition de logiciels SaaS B2B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Taille (employés / CA) */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taille (employés / CA)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: 250 employés / 10M€" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Processus métier (multi-select) */}
          <div className="md:col-span-2">
            <FormItem>
              <FormLabel>Processus métier associés</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCount === 0 
                      ? "Sélectionner des processus" 
                      : `${selectedCount} processus sélectionnés`}
                    <span className="ml-2 rounded-full bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center text-xs">
                      {selectedCount}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto" align="start">
                  <DropdownMenuLabel>Processus métier</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {processes.map(process => (
                    <DropdownMenuCheckboxItem
                      key={process.id}
                      checked={selectedProcesses.includes(process.id)}
                      onCheckedChange={() => toggleProcess(process.id)}
                    >
                      {process.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <FormDescription>
                Sélectionnez les processus métier pertinents pour cette entreprise
              </FormDescription>
            </FormItem>
          </div>
        </div>

        {/* Principaux produits/services */}
        <FormField
          control={form.control}
          name="products"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Principaux produits/services</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez les principaux produits ou services de l'entreprise" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Processus clés (description textuelle) */}
        <FormField
          control={form.control}
          name="processes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description des processus clés</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez les processus métier clés de l'entreprise" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Description textuelle complémentaire à la sélection de processus ci-dessus
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Défis majeurs */}
        <FormField
          control={form.control}
          name="challenges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Défis majeurs</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Quels sont les principaux défis auxquels l'entreprise est confrontée" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Objectifs stratégiques */}
        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objectifs stratégiques</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Quels sont les objectifs stratégiques de l'entreprise" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Technologies déjà utilisées */}
        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies déjà utilisées</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Quelles technologies ou systèmes d'information sont déjà en place" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white pb-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isAutoFilling}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || isAutoFilling}>
            {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyForm;
