import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bites, biteFiles, biteMetadata, bitePermissions, biteVersions, Bite, BiteFile } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// BITES QUERIES

export async function createBite(bite: {
  biteId: string;
  name: string;
  description?: string;
  createdBy: number;
  tags?: string[];
  framework?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bites).values({
    biteId: bite.biteId,
    name: bite.name,
    description: bite.description,
    createdBy: bite.createdBy,
    tags: JSON.stringify(bite.tags || []),
    framework: bite.framework || "vanilla",
  });

  return result;
}

export async function getBiteById(biteId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bites).where(eq(bites.biteId, biteId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublicBites(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bites)
    .where(eq(bites.isPublic, 1))
    .orderBy(desc(bites.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserBites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bites)
    .where(eq(bites.createdBy, userId))
    .orderBy(desc(bites.createdAt));
}

export async function updateBite(biteId: string, data: Partial<Bite>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(bites).set(data).where(eq(bites.biteId, biteId));
}

// BITE FILES QUERIES

export async function createBiteFile(file: {
  biteId: string;
  filename: string;
  content: string;
  fileType: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(biteFiles).values(file);
}

export async function getBiteFiles(biteId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(biteFiles).where(eq(biteFiles.biteId, biteId));
}

export async function updateBiteFile(biteId: string, filename: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(biteFiles)
    .set({ content, updatedAt: new Date() })
    .where(and(eq(biteFiles.biteId, biteId), eq(biteFiles.filename, filename)));
}

export async function deleteBiteFile(biteId: string, filename: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(biteFiles)
    .where(and(eq(biteFiles.biteId, biteId), eq(biteFiles.filename, filename)));
}

// BITE PERMISSIONS QUERIES

export async function addBitePermission(biteId: string, userId: number, role: "owner" | "developer" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(bitePermissions).values({
    biteId,
    userId,
    role,
  });
}

export async function getBitePermissions(biteId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bitePermissions).where(eq(bitePermissions.biteId, biteId));
}

export async function updateBitePermission(biteId: string, userId: number, role: "owner" | "developer" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(bitePermissions)
    .set({ role })
    .where(and(eq(bitePermissions.biteId, biteId), eq(bitePermissions.userId, userId)));
}

export async function deleteBitePermission(biteId: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(bitePermissions)
    .where(and(eq(bitePermissions.biteId, biteId), eq(bitePermissions.userId, userId)));
}

// BITE METADATA QUERIES

export async function createBiteMetadata(biteId: string, metadata: { version?: string; dependencies?: string[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(biteMetadata).values({
    biteId,
    version: metadata.version || "1.0.0",
    dependencies: JSON.stringify(metadata.dependencies || []),
  });
}

export async function getBiteMetadata(biteId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(biteMetadata).where(eq(biteMetadata.biteId, biteId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
