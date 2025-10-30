import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: userBites, isLoading } = trpc.bites.getUserBites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <Card className="bg-[#16213E] border-[#2E8B57]/30">
          <CardHeader>
            <CardTitle className="text-white">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Você precisa estar autenticado para acessar seu perfil.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-gray-400">Gerencie seus Bites e configurações</p>
        </div>

        {/* User Info */}
        <Card className="bg-[#16213E] border-[#2E8B57]/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nome
                </label>
                <p className="text-white text-lg">{user?.name || "Não informado"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-white text-lg">{user?.email || "Não informado"}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="mt-4"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>

        {/* User Bites */}
        <Card className="bg-[#16213E] border-[#2E8B57]/30">
          <CardHeader>
            <CardTitle className="text-white">Meus Bites</CardTitle>
            <CardDescription className="text-gray-400">
              Componentes que você criou
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#2E8B57]" />
              </div>
            ) : userBites && userBites.length > 0 ? (
              <div className="space-y-4">
                {userBites.map((bite) => (
                  <div
                    key={bite.biteId}
                    className="p-4 bg-[#0F3460] border border-[#2E8B57]/20 rounded-lg hover:border-[#2E8B57] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{bite.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {bite.description || "Sem descrição"}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-gray-400">
                          <span>⬇️ {bite.downloads} downloads</span>
                          <span>❤️ {bite.likes} likes</span>
                          <span>
                            {bite.isPublic ? "🌐 Público" : "🔒 Privado"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/b/${bite.biteId}`}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Você ainda não criou nenhum Bite</p>
                <Button
                  onClick={() => setLocation("/editor")}
                  className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
                >
                  Criar Primeiro Bite
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
