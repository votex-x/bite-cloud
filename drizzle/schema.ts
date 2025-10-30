import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatar: text("avatar"), // URL to user avatar
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bites table - represents reusable web components
 */
export const bites = mysqlTable("bites", {
  id: int("id").autoincrement().primaryKey(),
  biteId: varchar("biteId", { length: 10 }).notNull().unique(), // 10-char unique ID
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull(), // User ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tags: text("tags"), // JSON array of tags
  downloads: int("downloads").default(0),
  likes: int("likes").default(0),
  isPublic: int("isPublic").default(1), // 1 = public, 0 = private
  framework: varchar("framework", { length: 50 }).default("vanilla"), // vanilla, react, vue, etc
});

export type Bite = typeof bites.$inferSelect;
export type InsertBite = typeof bites.$inferInsert;

/**
 * Bite files table - stores HTML, CSS, JS, README, etc
 */
export const biteFiles = mysqlTable("biteFiles", {
  id: int("id").autoincrement().primaryKey(),
  biteId: varchar("biteId", { length: 10 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  content: text("content"), // File content
  fileType: varchar("fileType", { length: 50 }).notNull(), // html, css, js, md, json, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BiteFile = typeof biteFiles.$inferSelect;
export type InsertBiteFile = typeof biteFiles.$inferInsert;

/**
 * Bite metadata table - version info, dependencies, etc
 */
export const biteMetadata = mysqlTable("biteMetadata", {
  id: int("id").autoincrement().primaryKey(),
  biteId: varchar("biteId", { length: 10 }).notNull().unique(),
  version: varchar("version", { length: 20 }).default("1.0.0"),
  lastCommit: text("lastCommit"),
  dependencies: text("dependencies"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BiteMetadata = typeof biteMetadata.$inferSelect;
export type InsertBiteMetadata = typeof biteMetadata.$inferInsert;

/**
 * Bite permissions table - owner, developer, viewer access
 */
export const bitePermissions = mysqlTable("bitePermissions", {
  id: int("id").autoincrement().primaryKey(),
  biteId: varchar("biteId", { length: 10 }).notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "developer", "viewer"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BitePermission = typeof bitePermissions.$inferSelect;
export type InsertBitePermission = typeof bitePermissions.$inferInsert;

/**
 * Bite version history table - track changes
 */
export const biteVersions = mysqlTable("biteVersions", {
  id: int("id").autoincrement().primaryKey(),
  biteId: varchar("biteId", { length: 10 }).notNull(),
  versionNumber: int("versionNumber").notNull(),
  message: text("message"), // Commit message
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BiteVersion = typeof biteVersions.$inferSelect;
export type InsertBiteVersion = typeof biteVersions.$inferInsert;
