import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  savedBuilds: many(savedBuilds),
  bookmarkedGuides: many(bookmarkedGuides),
}));

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  specs: jsonb("specs").notNull().$type<Record<string, string | number>>(),
  description: text("description"),
  imageUrl: text("image_url"),
  compatibility: jsonb("compatibility").$type<string[]>(),
  pcPartPickerUrl: text("pc_part_picker_url"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const savedBuilds = pgTable("saved_builds", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  partsConfig: jsonb("parts_config").notNull().$type<{ partId: number; type: string; name: string; price: number }[]>(),
  pcPartPickerUrl: text("pc_part_picker_url"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedBuildsRelations = relations(savedBuilds, ({ one }) => ({
  user: one(users, {
    fields: [savedBuilds.userId],
    references: [users.id],
  }),
}));

export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  readTime: text("read_time"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  tags: jsonb("tags").$type<string[]>(),
});

export const bookmarkedGuides = pgTable("bookmarked_guides", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  guideId: integer("guide_id").references(() => guides.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarkedGuidesRelations = relations(bookmarkedGuides, ({ one }) => ({
  user: one(users, {
    fields: [bookmarkedGuides.userId],
    references: [users.id],
  }),
  guide: one(guides, {
    fields: [bookmarkedGuides.guideId],
    references: [guides.id],
  }),
}));

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  partId: integer("part_id").references(() => parts.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPartSchema = createInsertSchema(parts).omit({ id: true, lastUpdated: true });
export const insertSavedBuildSchema = createInsertSchema(savedBuilds).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGuideSchema = createInsertSchema(guides).omit({ id: true, publishedAt: true, updatedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;

export type SavedBuild = typeof savedBuilds.$inferSelect;
export type InsertSavedBuild = z.infer<typeof insertSavedBuildSchema>;

export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;

export type BookmarkedGuide = typeof bookmarkedGuides.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
