# Bites Cloud

Uma plataforma colaborativa para criação, compartilhamento e customização de componentes web reutilizáveis. Inspirada no GitHub, mas focada em componentes ("Bites") com editor integrado, preview ao vivo e sistema de permissões.

## 🎯 Funcionalidades Principais

- **Homepage** com grid de Bites publicados
- **Editor Integrado** com abas para HTML, CSS, JavaScript, README e configuração
- **Preview ao Vivo** em tempo real com sandbox seguro
- **Sistema de Autenticação** com Manus OAuth
- **Gerenciador de Arquivos** para criar, editar e deletar arquivos
- **Página de Perfil** com lista de Bites do usuário
- **Sistema de Colaboração** com permissões (owner, developer, viewer)
- **Página de Visualização** de Bites individuais com informações e estatísticas

## 🛠 Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL/TiDB com Drizzle ORM
- **Autenticação:** Manus OAuth
- **Storage:** S3 (configurável)

## 📋 Pré-requisitos

- Node.js 22.13.0 ou superior
- pnpm (ou npm/yarn)
- MySQL/TiDB database
- Conta Manus para OAuth

## 🚀 Instalação e Setup

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/bite-cloud.git
cd bite-cloud
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.local.example .env.local
```

**Variáveis obrigatórias:**
- `DATABASE_URL`: String de conexão MySQL
- `JWT_SECRET`: Chave secreta para sessões
- `VITE_APP_ID`: ID da aplicação Manus
- `OAUTH_SERVER_URL`: URL do servidor OAuth Manus
- `VITE_OAUTH_PORTAL_URL`: URL do portal de login Manus

### 4. Configure o banco de dados

```bash
pnpm db:push
```

Este comando gera e executa as migrações Drizzle.

### 5. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
bite-cloud/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Editor, Profile, BitePage)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (tRPC client)
│   │   ├── contexts/      # React contexts
│   │   ├── App.tsx        # Roteamento principal
│   │   └── index.css      # Estilos globais
│   └── index.html
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # Procedures tRPC
│   ├── db.ts              # Query helpers
│   └── _core/             # Infraestrutura (OAuth, context, etc)
├── drizzle/               # Schema e migrações
│   └── schema.ts          # Definição das tabelas
├── shared/                # Código compartilhado
└── package.json
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

- **users**: Usuários da plataforma
- **bites**: Componentes web
- **biteFiles**: Arquivos dos Bites (HTML, CSS, JS, etc)
- **biteMetadata**: Metadados (versão, dependências)
- **bitePermissions**: Permissões de acesso (owner, developer, viewer)
- **biteVersions**: Histórico de versões

## 🔐 Sistema de Permissões

Cada Bite tem um sistema de permissões baseado em roles:

- **owner**: Controle total (editar, deletar, adicionar colaboradores)
- **developer**: Pode editar arquivos e conteúdo
- **viewer**: Apenas visualizar

## 🎨 Design System

- **Cores Primárias:**
  - Sea Green: `#2E8B57` (ação principal)
  - Orange: `#FF6B35` (destaque)
  - Dark: `#1A1A2E` (fundo)
  - Light: `#F8F9FA` (texto claro)

- **Fonte:** Inter (Google Fonts)
- **Componentes:** shadcn/ui com Tailwind CSS
- **Efeitos:** Glassmorphism, gradientes

## 📝 Rotas Disponíveis

- `/` - Homepage com grid de Bites
- `/editor` - Criar novo Bite ou editar existente
- `/profile` - Perfil do usuário e seus Bites
- `/b/:biteId` - Visualizar Bite individual

## 🔌 Procedures tRPC

### Bites
- `bites.getPublic` - Listar Bites públicos
- `bites.getById` - Obter Bite específico
- `bites.getUserBites` - Listar Bites do usuário (autenticado)
- `bites.create` - Criar novo Bite (autenticado)
- `bites.update` - Atualizar Bite (permissão necessária)
- `bites.updateFile` - Atualizar arquivo (permissão necessária)
- `bites.deleteFile` - Deletar arquivo (owner)
- `bites.addCollaborator` - Adicionar colaborador (owner)
- `bites.getPermissions` - Obter permissões

### Autenticação
- `auth.me` - Obter usuário atual
- `auth.logout` - Fazer logout

## 🧪 Desenvolvimento

### Adicionar nova página

1. Crie o arquivo em `client/src/pages/NomePagina.tsx`
2. Registre a rota em `client/src/App.tsx`
3. Use hooks tRPC para dados: `trpc.feature.useQuery()`

### Adicionar nova tabela

1. Defina em `drizzle/schema.ts`
2. Execute `pnpm db:push`
3. Crie helpers em `server/db.ts`
4. Crie procedures em `server/routers.ts`

### Estilo

Todos os componentes usam Tailwind CSS e shadcn/ui. Mantenha consistência com o design system.

## 📦 Build para Produção

```bash
pnpm build
```

Gera otimizações para produção em `dist/`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para reportar bugs ou sugerir features, abra uma issue no repositório.

## 🎓 Próximos Passos

- [ ] Implementar personalizador visual interativo
- [ ] Adicionar sistema de versões e histórico
- [ ] Criar feature de download ZIP
- [ ] Implementar busca avançada e filtros
- [ ] Adicionar sistema de likes e comentários
- [ ] Criar dashboard de estatísticas

---

Desenvolvido com ❤️ usando React, TypeScript e Tailwind CSS.
