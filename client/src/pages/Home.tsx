import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: publicBites, isLoading: bitesLoading } = trpc.bites.getPublic.useQuery(
    { limit: 20, offset: 0 },
    { enabled: true }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]">
      {/* Header */}
      <header className="border-b border-[#2E8B57]/20 bg-[#1A1A2E]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-[#2E8B57]">{APP_TITLE}</h1>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/editor">
                  <Button variant="default" size="sm" className="bg-[#2E8B57] hover:bg-[#2E8B57]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Bite
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Perfil
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Entrar
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-white mb-4">
          Compartilhe Componentes Web
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Crie, customize e compartilhe componentes web reutilizáveis com a comunidade.
          Colabore em tempo real com outros desenvolvedores.
        </p>

        {!isAuthenticated && (
          <Button
            size="lg"
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90 text-white"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Comece Agora
          </Button>
        )}
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar Bites..."
            className="pl-10 bg-[#16213E] border-[#2E8B57]/30 text-white placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Bites Grid */}
      <section className="container mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-white mb-8">Bites em Destaque</h3>

        {bitesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2E8B57]" />
          </div>
        ) : publicBites && publicBites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicBites.map((bite) => (
              <Link key={bite.biteId} href={`/b/${bite.biteId}`}>
                <Card className="bg-[#16213E]/50 border-[#2E8B57]/30 hover:border-[#2E8B57] hover:shadow-lg hover:shadow-[#2E8B57]/20 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-white">{bite.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {bite.description || "Sem descrição"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {bite.tags && JSON.parse(bite.tags).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-[#2E8B57]/20 text-[#2E8B57] rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>⬇️ {bite.downloads}</span>
                        <span>❤️ {bite.likes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhum Bite encontrado</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-[#0F3460] py-16 border-t border-[#2E8B57]/20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">
            Funcionalidades
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#16213E]/50 border-[#2E8B57]/30">
              <CardHeader>
                <CardTitle className="text-[#2E8B57]">Editor Integrado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Edite HTML, CSS e JavaScript com preview ao vivo em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213E]/50 border-[#2E8B57]/30">
              <CardHeader>
                <CardTitle className="text-[#2E8B57]">Colaboração</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Convide outros desenvolvedores para colaborar em seus componentes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213E]/50 border-[#2E8B57]/30">
              <CardHeader>
                <CardTitle className="text-[#2E8B57]">Customização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Personalize cores, tamanhos e fontes com ferramentas visuais intuitivas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
