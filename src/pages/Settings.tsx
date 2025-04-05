
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Key } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const apiKeySchema = z.object({
  openaiApiKey: z.string().min(1, "La clé API est requise").startsWith("sk-", {
    message: "La clé API OpenAI doit commencer par sk-",
  }),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const Settings: React.FC = () => {
  const { matrixConfig, updateMatrixConfig } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get API key from localStorage if it exists
  const storedApiKey = localStorage.getItem("openai-api-key") || "";
  
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      openaiApiKey: storedApiKey,
    },
  });

  const onSubmit = async (data: ApiKeyFormValues) => {
    setIsLoading(true);
    
    try {
      // Store API key in localStorage
      localStorage.setItem("openai-api-key", data.openaiApiKey);
      
      // Test the API key with a simple request
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${data.openaiApiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        toast({
          title: "Clé API validée avec succès",
          description: "Votre clé OpenAI est valide et a été enregistrée.",
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur de validation",
          description: "La clé API n'est pas valide ou a expiré.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à l'API OpenAI. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem("openai-api-key");
    form.reset({ openaiApiKey: "" });
    toast({
      title: "Clé API supprimée",
      description: "La clé API OpenAI a été supprimée avec succès.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-navy">Paramètres</h1>
      
      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key size={16} /> Clés API
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configuration OpenAI</CardTitle>
              <CardDescription>
                Configurez votre clé API OpenAI pour accéder aux fonctionnalités d'intelligence artificielle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="openaiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clé API OpenAI</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="sk-..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          La clé API est stockée uniquement dans votre navigateur et n'est pas partagée.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Validation..." : "Enregistrer la clé API"}
                    </Button>
                    {storedApiKey && (
                      <Button type="button" variant="outline" onClick={clearApiKey}>
                        Supprimer la clé
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t pt-4 flex-col items-start">
              <p className="text-sm text-muted-foreground">
                Vous pouvez obtenir une clé API OpenAI en vous inscrivant sur{" "}
                <a 
                  href="https://platform.openai.com/account/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
              {storedApiKey && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  ✓ Clé API configurée
                </p>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
