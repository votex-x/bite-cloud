import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createBite,
  getBiteById,
  getPublicBites,
  getUserBites,
  updateBite,
  createBiteFile,
  getBiteFiles,
  updateBiteFile,
  deleteBiteFile,
  addBitePermission,
  getBitePermissions,
  updateBitePermission,
  deleteBitePermission,
  createBiteMetadata,
  getBiteMetadata,
  getUserById,
} from "./db";

// Helper to generate 10-char random ID
function generateBiteId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bites: router({
    // Get all public bites
    getPublic: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await getPublicBites(input.limit, input.offset);
      }),

    // Get single bite by ID
    getById: publicProcedure
      .input(z.object({ biteId: z.string() }))
      .query(async ({ input }) => {
        const bite = await getBiteById(input.biteId);
        if (!bite) return null;

        const files = await getBiteFiles(input.biteId);
        const metadata = await getBiteMetadata(input.biteId);
        const permissions = await getBitePermissions(input.biteId);

        return {
          ...bite,
          files: files.map(f => ({ filename: f.filename, content: f.content, fileType: f.fileType })),
          metadata,
          permissions,
        };
      }),

    // Get user's bites
    getUserBites: protectedProcedure.query(async ({ ctx }) => {
      return await getUserBites(ctx.user.id);
    }),

    // Create new bite
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          framework: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const biteId = generateBiteId();

        await createBite({
          biteId,
          name: input.name,
          description: input.description,
          createdBy: ctx.user.id,
          tags: input.tags,
          framework: input.framework,
        });

        // Create default files
        await createBiteFile({
          biteId,
          filename: "index.html",
          content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <h1>Bem-vindo ao ${input.name}</h1>
    <p>Edite este arquivo para começar!</p>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
          fileType: "html",
        });

        await createBiteFile({
          biteId,
          filename: "style.css",
          content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
  color: #F8F9FA;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  text-align: center;
  padding: 2rem;
  background: rgba(46, 139, 87, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(46, 139, 87, 0.3);
}

h1 {
  color: #2E8B57;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #B0B0B0;
  font-size: 1.1rem;
}`,
          fileType: "css",
        });

        await createBiteFile({
          biteId,
          filename: "script.js",
          content: `console.log('Bite criado com sucesso!');

// Adicione seu código JavaScript aqui
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado');
});`,
          fileType: "js",
        });

        await createBiteFile({
          biteId,
          filename: "README.md",
          content: `# ${input.name}

${input.description || "Descrição do seu componente"}

## Características

- Componente reutilizável
- Totalmente customizável
- Responsivo

## Como usar

1. Copie os arquivos
2. Inclua em seu projeto
3. Customize conforme necessário

## Licença

MIT`,
          fileType: "md",
        });

        await createBiteFile({
          biteId,
          filename: "bite.json",
          content: JSON.stringify(
            {
              name: input.name,
              description: input.description,
              version: "1.0.0",
              framework: input.framework || "vanilla",
              tags: input.tags || [],
            },
            null,
            2
          ),
          fileType: "json",
        });

        // Create metadata
        await createBiteMetadata(biteId, {
          version: "1.0.0",
          dependencies: [],
        });

        // Add owner permission
        await addBitePermission(biteId, ctx.user.id, "owner");

        return { biteId };
      }),

    // Update bite
    update: protectedProcedure
      .input(
        z.object({
          biteId: z.string(),
          name: z.string().optional(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          isPublic: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const bite = await getBiteById(input.biteId);
        if (!bite) throw new Error("Bite not found");

        // Check permissions
        const permissions = await getBitePermissions(input.biteId);
        const userPerm = permissions.find(p => p.userId === ctx.user.id);
        if (!userPerm || (userPerm.role !== "owner" && userPerm.role !== "developer")) {
          throw new Error("Unauthorized");
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description) updateData.description = input.description;
        if (input.tags) updateData.tags = JSON.stringify(input.tags);
        if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

        await updateBite(input.biteId, updateData);
        return { success: true };
      }),

    // Update file
    updateFile: protectedProcedure
      .input(
        z.object({
          biteId: z.string(),
          filename: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check permissions
        const permissions = await getBitePermissions(input.biteId);
        const userPerm = permissions.find(p => p.userId === ctx.user.id);
        if (!userPerm || (userPerm.role !== "owner" && userPerm.role !== "developer")) {
          throw new Error("Unauthorized");
        }

        await updateBiteFile(input.biteId, input.filename, input.content);
        return { success: true };
      }),

    // Create file (for upload functionality)
    createFile: protectedProcedure
      .input(
        z.object({
          biteId: z.string(),
          filename: z.string(),
          content: z.string().optional().nullable(),
          fileType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check permissions (Owner or Developer)
        const permissions = await getBitePermissions(input.biteId);
        const userPerm = permissions.find(p => p.userId === ctx.user.id);
        if (!userPerm || (userPerm.role !== "owner" && userPerm.role !== "developer")) {
          throw new Error("Unauthorized");
        }

        await createBiteFile({
          biteId: input.biteId,
          filename: input.filename,
          content: input.content,
          fileType: input.fileType,
        });
        return { success: true };
      }),

    // Delete file
    deleteFile: protectedProcedure
      .input(
        z.object({
          biteId: z.string(),
          filename: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check permissions
        const permissions = await getBitePermissions(input.biteId);
        const userPerm = permissions.find(p => p.userId === ctx.user.id);
        if (!userPerm || userPerm.role !== "owner") {
          throw new Error("Unauthorized");
        }

        await deleteBiteFile(input.biteId, input.filename);
        return { success: true };
      }),

    // Add collaborator
    addCollaborator: protectedProcedure
      .input(
        z.object({
          biteId: z.string(),
          userId: z.number(),
          role: z.enum(["owner", "developer", "viewer"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check permissions
        const permissions = await getBitePermissions(input.biteId);
        const userPerm = permissions.find(p => p.userId === ctx.user.id);
        if (!userPerm || userPerm.role !== "owner") {
          throw new Error("Unauthorized");
        }

        await addBitePermission(input.biteId, input.userId, input.role);
        return { success: true };
      }),

    // Get bite permissions
    getPermissions: publicProcedure
      .input(z.object({ biteId: z.string() }))
      .query(async ({ input }) => {
        const permissions = await getBitePermissions(input.biteId);
        const enriched = await Promise.all(
          permissions.map(async (p) => ({
            ...p,
            user: await getUserById(p.userId),
          }))
        );
        return enriched;
      }),
  }),
});

export type AppRouter = typeof appRouter;
