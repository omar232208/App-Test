import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projectStatusEnum = pgEnum("project_status", ["active", "completed", "archived", "paused"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  status: projectStatusEnum("status").default("active").notNull(),
  color: text("color").default("#6366F1").notNull(),
  icon: text("icon").default("folder").notNull(),
  progress: integer("progress").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasksTable = pgTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projectsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notesTable = pgTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").default("").notNull(),
  color: text("color").default("#6366F1").notNull(),
  tags: text("tags").array().default([]).notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const foldersTable = pgTable("folders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#6366F1").notNull(),
  icon: text("icon").default("folder").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const folderDocsTable = pgTable("folder_docs", {
  id: text("id").primaryKey(),
  folderId: text("folder_id").references(() => foldersTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedImagesTable = pgTable("saved_images", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  uri: text("uri").notNull(),
  caption: text("caption").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarksTable = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiMessagesTable = pgTable("ai_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, userId: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertFolderSchema = createInsertSchema(foldersTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertFolderDocSchema = createInsertSchema(folderDocsTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertSavedImageSchema = createInsertSchema(savedImagesTable).omit({ id: true, userId: true, createdAt: true });
export const insertBookmarkSchema = createInsertSchema(bookmarksTable).omit({ id: true, userId: true, createdAt: true });
export const insertAiMessageSchema = createInsertSchema(aiMessagesTable).omit({ id: true, userId: true, timestamp: true });

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
export type Note = typeof notesTable.$inferSelect;
export type AppFolder = typeof foldersTable.$inferSelect;
export type FolderDoc = typeof folderDocsTable.$inferSelect;
export type SavedImage = typeof savedImagesTable.$inferSelect;
export type Bookmark = typeof bookmarksTable.$inferSelect;
export type AiMessage = typeof aiMessagesTable.$inferSelect;
