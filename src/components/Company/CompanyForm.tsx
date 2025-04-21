
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Company } from '@/types';
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
import { fetchCompanyInfoByName } from '@/services/companyInfoService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultBusinessConfig } from '@/data/defaultBusinessConfig';

const companySchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
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
  onSubmit: (data: CompanyFormValues) => void;
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
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData || {
      name: '',
      industry: '',
      size: '',
      products: '',
      processes: '',
      challenges: '',
      objectives: '',
      technologies: '',
    },
  });

  const handleAutoFill = async () => {
    const companyName = form.getValues("name");
    
    if (!companyName || companyName.length < 2) {
      toast.error("Veuillez d'abord saisir un nom d'entreprise valide");
      return;
    }
    
    setIsAutoFilling(true);
    
    try {
      const companyInfo = await fetchCompanyInfoByName(companyName);
      
      // Si un nom normalisé est disponible, l'utiliser
      if (companyInfo.normalizedName && companyInfo.normalizedName !== companyName) {
        form.setValue("name", companyInfo.normalizedName);
      }

      // Mettre à jour les champs du formulaire avec les valeurs récupérées
      form.setValue("industry", companyInfo.industry);
      form.setValue("size", companyInfo.size);
      form.setValue("products", companyInfo.products);
      form.setValue("processes", companyInfo.processes);
      form.setValue("challenges", companyInfo.challenges);
      form.setValue("objectives", companyInfo.objectives);
      form.setValue("technologies", companyInfo.technologies);
      
      // Forcer la mise à jour du formulaire pour que le sélecteur de secteur soit correctement affiché
      form.trigger();
      
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {defaultBusinessConfig.sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

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

        <FormField
          control={form.control}
          name="processes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processus clés</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez les processus métier clés de l'entreprise" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
