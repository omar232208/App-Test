import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, jsonb, real } from "drizzle-orm/pg-core";
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

export const agentTypeEnum = pgEnum("agent_type", [
  "project_manager", "frontend", "backend", "fullstack",
  "ui_ux", "database", "devops", "security",
  "qa_testing", "documentation", "code_review", "bug_fixing"
]);

export const agentStatusEnum = pgEnum("agent_status", ["idle", "working", "completed", "failed"]);

export const aiAgentsTable = pgTable("ai_agents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: agentTypeEnum("type").notNull(),
  name: text("name").notNull(),
  status: agentStatusEnum("status").default("idle").notNull(),
  config: jsonb("config").default({}).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentTasksTable = pgTable("agent_tasks", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => aiAgentsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] }).default("pending").notNull(),
  result: jsonb("result").default({}).notNull(),
  prompt: text("prompt").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const activityLogTable = pgTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  read: boolean("read").default(false).notNull(),
  actionUrl: text("action_url"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPostsTable = pgTable("community_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default([]).notNull(),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityCommentsTable = pgTable("community_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => communityPostsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityLikesTable = pgTable("community_likes", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => communityPostsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityFollowsTable = pgTable("community_follows", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").notNull(),
  followingId: text("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channelsTable = pgTable("channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  type: text("type", { enum: ["channel", "direct"] }).default("channel").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channelMembersTable = pgTable("channel_members", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").references(() => channelsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const channelMessagesTable = pgTable("channel_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").references(() => channelsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "voice", "image", "file"] }).default("text").notNull(),
  replyTo: text("reply_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cloudFilesTable = pgTable("cloud_files", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").default(0).notNull(),
  url: text("url").notNull(),
  folder: text("folder").default("/").notNull(),
  shared: boolean("shared").default(false).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deploymentsTable = pgTable("deployments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  platform: text("platform", { enum: ["vercel", "netlify", "firebase", "railway", "render", "docker", "github_actions"] }).notNull(),
  status: text("status", { enum: ["pending", "building", "deploying", "live", "failed"] }).default("pending").notNull(),
  url: text("url"),
  branch: text("branch").default("main").notNull(),
  commitHash: text("commit_hash"),
  logs: text("logs").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  device: text("device").default("").notNull(),
  deviceType: text("device_type").default("unknown").notNull(),
  ip: text("ip").default("").notNull(),
  location: text("location").default("").notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeysTable = pgTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  scopes: text("scopes").array().default([]).notNull(),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlansEnum = pgEnum("subscription_plan", ["free", "pro", "teams", "enterprise"]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  plan: subscriptionPlansEnum("plan").default("free").notNull(),
  features: jsonb("features").default({}).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const calendarEventsTable = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  type: text("type", { enum: ["meeting", "deadline", "reminder", "sprint", "focus"] }).default("reminder").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  allDay: boolean("all_day").default(false).notNull(),
  projectId: text("project_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const meetingsTable = pgTable("meetings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").default("").notNull(),
  transcript: text("transcript").default("").notNull(),
  actionItems: jsonb("action_items").default([]).notNull(),
  duration: integer("duration").default(0).notNull(),
  participants: text("participants").array().default([]).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const timeTrackingTable = pgTable("time_tracking", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  sessionStart: timestamp("session_start").notNull(),
  sessionEnd: timestamp("session_end"),
  duration: integer("duration").default(0).notNull(),
  type: text("type", { enum: ["coding", "break", "meeting", "planning", "review"] }).default("coding").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStatsTable = pgTable("user_stats", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  productivityScore: real("productivity_score").default(0).notNull(),
  focusScore: real("focus_score").default(0).notNull(),
  codingHours: real("coding_hours").default(0).notNull(),
  weeklyStats: jsonb("weekly_stats").default({}).notNull(),
  monthlyStats: jsonb("monthly_stats").default({}).notNull(),
  heatmapData: jsonb("heatmap_data").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, userId: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertAIAgentSchema = createInsertSchema(aiAgentsTable).omit({ id: true, userId: true, createdAt: true, lastActive: true });
export const insertActivityLogSchema = createInsertSchema(activityLogTable).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPostsTable).omit({ id: true, userId: true, likes: true, comments: true, createdAt: true, updatedAt: true });
export const insertDeploymentSchema = createInsertSchema(deploymentsTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEventsTable).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertTimeTrackingSchema = createInsertSchema(timeTrackingTable).omit({ id: true, userId: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, userId: true, createdAt: true });

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
export type Note = typeof notesTable.$inferSelect;
export type AppFolder = typeof foldersTable.$inferSelect;
export type FolderDoc = typeof folderDocsTable.$inferSelect;
export type SavedImage = typeof savedImagesTable.$inferSelect;
export type Bookmark = typeof bookmarksTable.$inferSelect;
export type AiMessage = typeof aiMessagesTable.$inferSelect;
export type AiAgent = typeof aiAgentsTable.$inferSelect;
export type AgentTask = typeof agentTasksTable.$inferSelect;
export type ActivityLog = typeof activityLogTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type CommunityPost = typeof communityPostsTable.$inferSelect;
export type Channel = typeof channelsTable.$inferSelect;
export type ChannelMessage = typeof channelMessagesTable.$inferSelect;
export type CloudFile = typeof cloudFilesTable.$inferSelect;
export type Deployment = typeof deploymentsTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type ApiKey = typeof apiKeysTable.$inferSelect;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type CalendarEvent = typeof calendarEventsTable.$inferSelect;
export type Meeting = typeof meetingsTable.$inferSelect;
export type TimeTrackingEntry = typeof timeTrackingTable.$inferSelect;
export type UserStats = typeof userStatsTable.$inferSelect;
