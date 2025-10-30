import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Eye, Code } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { UploadFileDialog } from "@/components/UploadFileDialog";
import { NewFileDialog } from "@/components/NewFileDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, PlusCircle } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker"; // Componente a ser criado
import { Slider } from "@/components/ui/slider"; // Componente já existente

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
  const [customization, setCustomization] = useState({
    primaryColor: "#2E8B57", // Cor inicial baseada no tema
    borderRadius: 8, // Valor inicial
    fontSize: 16, // Valor inicial
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);

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

      // Carregar customizações do bite.json
      const jsonFile = bite.files?.find(f => f.filename === "bite.json");
      if (jsonFile && jsonFile.content) {
        try {
          const json = JSON.parse(jsonFile.content);
          if (json.customization) {
            setCustomization(json.customization);
          }
        } catch (e) {
          console.error("Erro ao parsear bite.json:", e);
        }
      }
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

  const handleUploadFile = async (file: File) => {
    if (!biteId) return;

    const filename = file.name;
    const fileType = filename.split(".").pop() || "";

    if (!["html", "css", "js"].includes(fileType)) {
      alert("Apenas arquivos .html, .css e .js são suportados para upload.");
      return;
    }

    try {
      setIsUploading(true);
      const fileContent = await file.text(); // Conversão do arquivo para texto
      
      await createMutation.mutateAsync({
        biteId,
        filename,
        content: fileContent,
        fileType,
      });

      // Atualiza o estado local para exibir o novo arquivo
      setFiles(prevFiles => [...prevFiles, { filename, content: fileContent, fileType }]);
      setActiveTab(fileType); // Abre a aba do arquivo recém-criado

      alert(`Arquivo ${filename} enviado e convertido para texto com sucesso!`);
      setShowUploadDialog(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Erro ao enviar o arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNewFile = async (filename: string, fileType: string) => {
    if (!biteId) return;

    try {
      setIsSaving(true);
      
      // Conteúdo inicial baseado no tipo de arquivo
      let content = "";
      if (fileType === "html") {
        content = `<!-- ${filename} -->\n<div>Novo componente HTML</div>`;
      } else if (fileType === "css") {
        content = `/* ${filename} */\n.new-component { color: var(--primary-color); }`;
      } else if (fileType === "js") {
        content = `// ${filename} \nconsole.log('Novo arquivo JS criado');`;
      } else if (fileType === "md") {
        content = `# ${filename}\n\nDocumentação do novo arquivo.`;
      } else {
        content = `// ${filename} \n`;
      }

      await createMutation.mutateAsync({
        biteId,
        filename,
        content,
        fileType,
      });

      // Atualiza o estado local para exibir o novo arquivo
      setFiles(prevFiles => [...prevFiles, { filename, content, fileType }]);
      setActiveTab(fileType); // Abre a aba do arquivo recém-criado

      alert(`Arquivo ${filename} criado com sucesso!`);
      setShowNewFileDialog(false);
    } catch (error) {
      console.error("Error creating new file:", error);
      alert("Erro ao criar novo arquivo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFile = async () => {
    if (!biteId) return;

    // 1. Salvar o arquivo ativo
    const activeFile = files.find((f) => f.filename.split(".")[0] === activeTab || f.fileType === activeTab);
    if (activeFile && activeFile.content) {
      try {
        setIsSaving(true);
        await updateFileMutation.mutateAsync({
          biteId,
          filename: activeFile.filename,
          content: activeFile.content,
        });
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }

    // 2. Salvar as customizações no bite.json
    const jsonFileIndex = files.findIndex(f => f.filename === "bite.json");
    if (jsonFileIndex !== -1) {
      const currentJsonContent = files[jsonFileIndex].content;
      try {
        const json = JSON.parse(currentJsonContent || "{}");
        json.customization = customization;
        const newJsonContent = JSON.stringify(json, null, 2);

        await updateFileMutation.mutateAsync({
          biteId,
          filename: "bite.json",
          content: newJsonContent,
        });

        // Atualiza o estado local do bite.json
        setFiles(prevFiles => prevFiles.map((f, index) => index === jsonFileIndex ? { ...f, content: newJsonContent } : f));

      } catch (error) {
        console.error("Error saving customization to bite.json:", error);
      }
    }

    setIsSaving(false);
  };
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

    // 1. Injetar variáveis CSS de customização
    const customCSS = `
      :root {
        --primary-color: ${customization.primaryColor};
        --border-radius: ${customization.borderRadius}px;
        --font-size: ${customization.fontSize}px;
      }
    `;

    // 2. Injetar CSS e JS no HTML
    let html = htmlFile.content;
    
    // Injetar variáveis e o CSS do usuário
    let styleInjection = `<style>${customCSS}`;
    if (cssFile && cssFile.content) {
      styleInjection += cssFile.content;
    }
    styleInjection += `</style>`;

    html = html.replace("</head>", `${styleInjection}</head>`);

    // Injetar JS
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
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowUploadDialog(true)}
              variant="outline"
              className="bg-[#16213E] border-[#2E8B57]/30 hover:bg-[#16213E]/80 text-white"
              disabled={isSaving || isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload de Arquivo
            </Button>
            <Button
              onClick={() => setShowNewFileDialog(true)}
              variant="outline"
              className="bg-[#16213E] border-[#2E8B57]/30 hover:bg-[#16213E]/80 text-white"
              disabled={isSaving || isUploading}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Arquivo
            </Button>
          </div>
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

        {/* Componente de Upload de Arquivo (Modal) */}
        <UploadFileDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleUploadFile}
          isUploading={isUploading}
        />

        {/* Componente de Novo Arquivo (Modal) */}
        <NewFileDialog
          isOpen={showNewFileDialog}
          onClose={() => setShowNewFileDialog(false)}
          onNewFile={handleNewFile}
          isCreating={isSaving}
        />

	        {/* Editor and Preview */}
	        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Editor */}
	          <Card className="lg:col-span-2 bg-[#16213E] border-[#2E8B57]/30 flex flex-col min-h-[400px] lg:h-[600px]">
            <CardHeader className="border-b border-[#2E8B57]/20">
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
	              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
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
	                    <div className="h-full">
	                      {/* Usar um editor de código de verdade seria melhor, mas por enquanto, Textarea com overflow */}
	                      <Textarea
	                        value={getFileContent() || ""}
	                        onChange={(e) => handleFileChange(e.target.value)}
	                        className="w-full h-full bg-[#0F3460] border-0 text-white font-mono text-sm rounded-none resize-none p-4"
	                        placeholder="Edite seu código aqui..."
	                      />
	                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Personalizador e Preview */}
	          <Card className="bg-[#16213E] border-[#2E8B57]/30 flex flex-col min-h-[400px] lg:h-[600px]">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <TabsList className="bg-[#0F3460] border-b border-[#2E8B57]/20 rounded-none">
                <TabsTrigger value="preview" className="text-gray-300 data-[state=active]:text-[#2E8B57]">
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </TabsTrigger>
                <TabsTrigger value="customizer" className="text-gray-300 data-[state=active]:text-[#2E8B57]">
                  <Code className="w-4 h-4 mr-2" /> Personalizar
                </TabsTrigger>
              </TabsList>
	              <TabsContent value="preview" className="flex-1 p-0 overflow-hidden h-full">
	                <iframe
	                  srcDoc={getPreviewContent()}
	                  className="w-full h-full border-0"
	                  title="Preview"
	                  sandbox="allow-scripts allow-same-origin"
	                />
              </TabsContent>
              <TabsContent value="customizer" className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white border-b border-[#2E8B57]/20 pb-2">Personalizador Visual</h3>

                  {/* Cor Primária */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cor Primária</label>
                    <ColorPicker
                      color={customization.primaryColor}
                      onChange={(color) => setCustomization(prev => ({ ...prev, primaryColor: color }))}
                    />
                  </div>

                  {/* Raio da Borda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Raio da Borda: {customization.borderRadius}px
                    </label>
                    <Slider
                      value={[customization.borderRadius]}
                      onValueChange={(val) => setCustomization(prev => ({ ...prev, borderRadius: val[0] }))}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Tamanho da Fonte */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tamanho da Fonte: {customization.fontSize}px
                    </label>
                    <Slider
                      value={[customization.fontSize]}
                      onValueChange={(val) => setCustomization(prev => ({ ...prev, fontSize: val[0] }))}
                      max={24}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-gray-400 mt-4">
                    As customizações serão injetadas no CSS do seu Bite. Lembre-se de usar variáveis CSS como <code>--primary-color</code> no seu código para que funcionem.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
            <CardHeader className="border-b border-[#2E8B57]/20">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
	            <CardContent className="flex-1 p-0 overflow-hidden h-full">
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
