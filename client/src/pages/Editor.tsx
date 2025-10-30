import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Eye, Code } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditorFile {
  filename: string;
  content: string | null;
  fileType: string;
}

export default function Editor() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/b/:biteId");
  const [, setLocation] = useLocation();
  const biteId = params?.biteId;

  const [isCreating, setIsCreating] = useState(!biteId);
  const [biteName, setBiteName] = useState("");
  const [biteDescription, setBiteDescription] = useState("");
  const [files, setFiles] = useState<EditorFile[]>([]);
  const [activeTab, setActiveTab] = useState("html");
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const { data: bite, isLoading: biteLoading } = trpc.bites.getById.useQuery(
    { biteId: biteId || "" },
    { enabled: !!biteId }
  );

  const createMutation = trpc.bites.create.useMutation();
  const updateMutation = trpc.bites.update.useMutation();
  const updateFileMutation = trpc.bites.updateFile.useMutation();

  // Load bite data
  useEffect(() => {
    if (bite) {
      setBiteName(bite.name);
      setBiteDescription(bite.description || "");
      setFiles(bite.files || []);
      setIsCreating(false);
    }
  }, [bite]);

  const handleCreateBite = async () => {
    if (!biteName.trim()) return;

    try {
      setIsSaving(true);
      const result = await createMutation.mutateAsync({
        name: biteName,
        description: biteDescription,
        tags: [],
      });
      setLocation(`/b/${result.biteId}`);
    } catch (error) {
      console.error("Error creating bite:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFile = async () => {
    if (!biteId) return;

    const activeFile = files.find((f) => f.filename.split(".")[0] === activeTab || f.fileType === activeTab);
    if (!activeFile || !activeFile.content) return;

    try {
      setIsSaving(true);
      await updateFileMutation.mutateAsync({
        biteId,
        filename: activeFile.filename,
        content: activeFile.content,
      });
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (content: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) =>
        f.filename.split(".")[0] === activeTab || f.fileType === activeTab
          ? { ...f, content: content || null }
          : f
      )
    );
  };

  const getFileContent = () => {
    return files.find((f) => f.filename.split(".")[0] === activeTab || f.fileType === activeTab)?.content || null;
  };

  const getPreviewContent = () => {
    const htmlFile = files.find((f) => f.fileType === "html");
    const cssFile = files.find((f) => f.fileType === "css");
    const jsFile = files.find((f) => f.fileType === "js");

    if (!htmlFile || !htmlFile.content) return "";

    // Inject CSS and JS into HTML
    let html = htmlFile.content;
    if (cssFile && cssFile.content) {
      html = html.replace("</head>", `<style>${cssFile.content}</style></head>`);
    }
    if (jsFile && jsFile.content) {
      html = html.replace("</body>", `<script>${jsFile.content}<\/script></body>`);
    }

    return html;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <Card className="bg-[#16213E] border-[#2E8B57]/30">
          <CardHeader>
            <CardTitle className="text-white">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Você precisa estar autenticado para acessar o editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (biteLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2E8B57]" />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#16213E] border-[#2E8B57]/30">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Criar Novo Bite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Bite
                </label>
                <Input
                  placeholder="Ex: Floating Navbar"
                  className="bg-[#0F3460] border-[#2E8B57]/30 text-white"
                  value={biteName}
                  onChange={(e) => setBiteName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  placeholder="Descreva seu componente..."
                  className="bg-[#0F3460] border-[#2E8B57]/30 text-white"
                  value={biteDescription}
                  onChange={(e) => setBiteDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleCreateBite}
                disabled={!biteName.trim() || isSaving}
                className="w-full bg-[#2E8B57] hover:bg-[#2E8B57]/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Bite"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{biteName}</h1>
            <p className="text-gray-400">{biteDescription}</p>
          </div>
          <Button
            onClick={handleSaveFile}
            disabled={isSaving}
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>

        {/* Editor and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card className="bg-[#16213E] border-[#2E8B57]/30 h-[600px] flex flex-col">
            <CardHeader className="border-b border-[#2E8B57]/20">
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="bg-[#0F3460] border-b border-[#2E8B57]/20 rounded-none">
                  {files.map((file) => (
                    <TabsTrigger
                      key={file.filename}
                      value={file.filename.split(".")[0]}
                      className="text-gray-300 data-[state=active]:text-[#2E8B57]"
                    >
                      {file.filename}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {files.map((file) => (
                  <TabsContent
                    key={file.filename}
                    value={file.filename.split(".")[0]}
                    className="flex-1 p-0"
                  >
                    <Textarea
                      value={getFileContent() || ""}
                      onChange={(e) => handleFileChange(e.target.value)}
                      className="w-full h-full bg-[#0F3460] border-0 text-white font-mono text-sm rounded-none resize-none"
                      placeholder="Edite seu código aqui..."
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-[#16213E] border-[#2E8B57]/30 h-[600px] flex flex-col">
            <CardHeader className="border-b border-[#2E8B57]/20">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <iframe
                srcDoc={getPreviewContent()}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
