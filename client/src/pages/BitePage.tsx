import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Edit, Heart, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BitePage() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/b/:biteId");
  const [, setLocation] = useLocation();
  const biteId = params?.biteId;

  const { data: bite, isLoading } = trpc.bites.getById.useQuery(
    { biteId: biteId || "" },
    { enabled: !!biteId }
  );

  const { data: permissions } = trpc.bites.getPermissions.useQuery(
    { biteId: biteId || "" },
    { enabled: !!biteId }
  );

  const isOwner = permissions?.some((p) => p.userId === user?.id && p.role === "owner");
  const canEdit = isOwner || permissions?.some((p) => p.userId === user?.id && p.role === "developer");

  const getPreviewContent = () => {
    if (!bite?.files) return "";

    const htmlFile = bite.files.find((f) => f.fileType === "html");
    const cssFile = bite.files.find((f) => f.fileType === "css");
    const jsFile = bite.files.find((f) => f.fileType === "js");

    if (!htmlFile || !htmlFile.content) return "";

    let html = htmlFile.content;
    if (cssFile && cssFile.content) {
      html = html.replace("</head>", `<style>${cssFile.content}</style></head>`);
    }
    if (jsFile && jsFile.content) {
      html = html.replace("</body>", `<script>${jsFile.content}<\/script></body>`);
    }

    return html;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2E8B57]" />
      </div>
    );
  }

  if (!bite) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <Card className="bg-[#16213E] border-[#2E8B57]/30">
          <CardHeader>
            <CardTitle className="text-white">Bite não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">O Bite que você procura não existe ou foi removido.</p>
            <Button
              onClick={() => setLocation("/")}
              className="mt-4 bg-[#2E8B57] hover:bg-[#2E8B57]/90"
            >
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]">
      {/* Header */}
      <header className="border-b border-[#2E8B57]/20 bg-[#1A1A2E]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-white"
          >
            ← Voltar
          </Button>

          <div className="flex items-center gap-3">
            {canEdit && isAuthenticated && (
              <Button
                onClick={() => setLocation(`/b/${biteId}`)}
                className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview */}
            <Card className="bg-[#16213E] border-[#2E8B57]/30 mb-8 overflow-hidden">
              <div className="aspect-video bg-[#0F3460]">
                <iframe
                  srcDoc={getPreviewContent()}
                  className="w-full h-full border-0"
                  title="Bite Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </Card>

            {/* Files */}
            <Card className="bg-[#16213E] border-[#2E8B57]/30">
              <CardHeader>
                <CardTitle className="text-white">Arquivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bite.files?.map((file) => (
                    <div
                      key={file.filename}
                      className="p-3 bg-[#0F3460] border border-[#2E8B57]/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm text-[#2E8B57]">{file.filename}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.content?.length || 0)} caracteres
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-[#2E8B57]/20 text-[#2E8B57] rounded">
                          {file.fileType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="bg-[#16213E] border-[#2E8B57]/30">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{bite.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">{bite.description || "Sem descrição"}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Downloads</span>
                    <span className="text-white font-semibold">{bite.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Likes</span>
                    <span className="text-white font-semibold">{bite.likes}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-semibold">
                      {bite.isPublic ? "🌐 Público" : "🔒 Privado"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {bite.tags && JSON.parse(bite.tags).length > 0 && (
              <Card className="bg-[#16213E] border-[#2E8B57]/30">
                <CardHeader>
                  <CardTitle className="text-white">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(bite.tags).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 bg-[#2E8B57]/20 text-[#2E8B57] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card className="bg-[#16213E] border-[#2E8B57]/30">
              <CardHeader>
                <CardTitle className="text-white">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Versão</p>
                  <p className="text-white font-semibold">{bite.metadata?.version || "1.0.0"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Framework</p>
                  <p className="text-white font-semibold">{bite.framework || "vanilla"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Criado em</p>
                  <p className="text-white font-semibold">
                    {new Date(bite.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
