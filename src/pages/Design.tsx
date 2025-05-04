
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define types for storing Figma files
interface FigmaFile {
  id: string;
  name: string;
  url: string;
  folderId: string | null;
  createdAt: string;
}

const Design = () => {
  const [figmaUrl, setFigmaUrl] = useState<string>("");
  const [figmaName, setFigmaName] = useState<string>("");
  const [figmaFiles, setFigmaFiles] = useState<FigmaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFile, setActiveFile] = useState<FigmaFile | null>(null);
  const { toast } = useToast();

  // Function to load saved Figma files
  const loadFigmaFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('figma_files')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      if (data) {
        setFigmaFiles(data);
        
        // Set active file to the most recent one if available
        if (data.length > 0 && !activeFile) {
          setActiveFile(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading Figma files:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fichiers Figma",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    loadFigmaFiles();
  }, []);

  // Function to save a new Figma file
  const handleSaveFigmaFile = async () => {
    if (!figmaUrl) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir une URL Figma valide",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a name if not provided
      const name = figmaName || `Design ${new Date().toLocaleDateString()}`;
      
      // Extract file ID from URL if possible
      const urlObj = new URL(figmaUrl);
      const fileIdMatch = urlObj.pathname.match(/\/file\/([^/]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      
      const newFile = {
        name,
        url: figmaUrl,
        file_id: fileId,
        folder_id: null // Can be linked to current folder later
      };

      const { data, error } = await supabase
        .from('figma_files')
        .insert(newFile)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Fichier Figma ajouté",
        description: `Le fichier "${name}" a été enregistré avec succès`,
      });

      // Reset form
      setFigmaUrl("");
      setFigmaName("");
      
      // Reload files list
      loadFigmaFiles();
    } catch (error) {
      console.error('Error saving Figma file:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le fichier Figma",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = (file: FigmaFile) => {
    setActiveFile(file);
  };

  // Generate embed URL for Figma
  const getEmbedUrl = (url: string) => {
    try {
      if (!url) return '';
      
      // If it's already an embed URL, return as is
      if (url.includes('figma.com/embed')) return url;
      
      // Convert standard URL to embed URL
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      if (path.includes('/file/')) {
        const baseUrl = 'https://www.figma.com/embed';
        const result = `${baseUrl}${path}`;
        return result;
      }
      
      // If URL format isn't recognized, return original
      return url;
    } catch (e) {
      console.error('Error parsing Figma URL:', e);
      return url;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Design</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with file list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Fichiers Figma</CardTitle>
              <CardDescription>
                Ajoutez et gérez vos fichiers de design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nom du fichier (optionnel)"
                  value={figmaName}
                  onChange={(e) => setFigmaName(e.target.value)}
                />
                <Input
                  placeholder="URL du fichier Figma"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  onClick={handleSaveFigmaFile}
                  disabled={isLoading || !figmaUrl}
                >
                  {isLoading ? "Chargement..." : "Ajouter"}
                </Button>
              </div>
              
              <div className="mt-4 space-y-2">
                {figmaFiles.map((file) => (
                  <div 
                    key={file.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                      activeFile?.id === file.id ? 'bg-gray-100 border-primary' : ''
                    }`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 truncate">{file.url}</p>
                  </div>
                ))}
                
                {figmaFiles.length === 0 && !isLoading && (
                  <p className="text-sm text-gray-500">Aucun fichier Figma enregistré</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{activeFile?.name || "Aperçu du design"}</CardTitle>
              {activeFile && (
                <CardDescription>
                  <a href={activeFile.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Ouvrir dans Figma
                  </a>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {activeFile ? (
                <div className="w-full border rounded overflow-hidden">
                  <iframe
                    src={getEmbedUrl(activeFile.url)}
                    title="Figma Design"
                    width="100%"
                    height="600"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-gray-50 border rounded">
                  <p className="text-gray-500">Sélectionnez un fichier Figma pour afficher son contenu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Design;
