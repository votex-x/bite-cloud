# Guia do Usuário - Bites Cloud

**Website:** https://bite-cloud.manus.space (ou seu domínio customizado)

**Propósito:** Plataforma colaborativa para criar, compartilhar e customizar componentes web reutilizáveis com editor integrado e preview ao vivo.

**Acesso:** Login obrigatório via Manus OAuth para criar e editar Bites. Visualização de componentes públicos sem autenticação.

---

## Powered by Manus

**Stack Tecnológico:** React 19 + TypeScript + Tailwind CSS 4 (Frontend), Express 4 + tRPC 11 (Backend), MySQL com Drizzle ORM (Database), Manus OAuth (Autenticação).

**Deployment:** Auto-scaling infrastructure com global CDN e banco de dados gerenciado.

---

## Usando seu Website

### 1. Criar um Novo Bite

Clique no botão **"Novo Bite"** na homepage. Preencha o nome e descrição do seu componente. O sistema cria automaticamente os arquivos padrão (HTML, CSS, JavaScript, README e configuração). Você será redirecionado para o editor.

### 2. Editar seu Componente

No editor, você encontrará abas para editar cada arquivo:
- **index.html** - Estrutura do seu componente
- **style.css** - Estilos e animações
- **script.js** - Lógica JavaScript
- **README.md** - Documentação
- **bite.json** - Configurações

O **preview ao vivo** à direita atualiza em tempo real conforme você edita. Clique em **"Salvar"** para guardar suas mudanças.

### 3. Visualizar Componentes

Na homepage, você vê um grid com todos os Bites públicos. Clique em qualquer card para ver o componente em ação, ler a documentação e verificar informações como downloads e likes. Se você for o dono ou colaborador, verá um botão **"Editar"**.

### 4. Gerenciar seu Perfil

Acesse **"Perfil"** no menu superior. Aqui você vê todos os seus Bites, informações da conta e pode fazer logout. Cada Bite mostra estatísticas (downloads, likes) e status (público/privado).

### 5. Colaborar com Outros

Quando estiver editando um Bite, você pode adicionar colaboradores fornecendo seus emails. Defina o nível de acesso:
- **Owner** - Controle total
- **Developer** - Pode editar arquivos
- **Viewer** - Apenas visualizar

---

## Gerenciando seu Website

### Settings (Configurações)

Acesse o painel **Settings** no Management UI para:
- Alterar o título e logo da plataforma
- Configurar domínio customizado
- Gerenciar variáveis de ambiente (secrets)
- Ajustar visibilidade e permissões

### Database (Banco de Dados)

O painel **Database** permite visualizar e gerenciar dados diretamente:
- Usuários cadastrados
- Bites criados
- Permissões de acesso
- Histórico de versões

### Dashboard

Monitore estatísticas da plataforma:
- Total de Bites públicos
- Usuários ativos
- Downloads e likes
- Tráfego do site

---

## Próximos Passos

**Fale com Manus AI a qualquer momento para solicitar mudanças ou adicionar novas funcionalidades.** Você pode expandir a plataforma com:

- Personalizador visual interativo (modificar cores, tamanhos, fontes com interface visual)
- Sistema de versões com histórico de commits
- Fork de Bites para criar variações
- Busca avançada e filtros por tags
- Sistema de comentários e avaliações
- Exportação em ZIP e embed em outros sites

Comece criando seu primeiro Bite agora e compartilhe com a comunidade!
