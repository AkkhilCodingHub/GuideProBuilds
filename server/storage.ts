import { 
  type User, 
  type InsertUser, 
  type Part, 
  type InsertPart, 
  type SavedBuild, 
  type InsertSavedBuild,
  type Guide,
  type InsertGuide,
  type BookmarkedGuide,
  users,
  parts,
  savedBuilds,
  guides,
  bookmarkedGuides,
  priceHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parts operations
  getPart(id: number): Promise<Part | undefined>;
  searchParts(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
  }): Promise<Part[]>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined>;
  upsertPartByExternalId(externalId: string, part: InsertPart): Promise<Part>;
  getPartsByType(type: string): Promise<Part[]>;
  
  // Saved builds operations
  getSavedBuild(id: number): Promise<SavedBuild | undefined>;
  getUserBuilds(userId: string): Promise<SavedBuild[]>;
  createSavedBuild(build: InsertSavedBuild): Promise<SavedBuild>;
  updateSavedBuild(id: number, build: Partial<InsertSavedBuild>): Promise<SavedBuild | undefined>;
  deleteSavedBuild(id: number): Promise<boolean>;
  getPublicBuilds(): Promise<SavedBuild[]>;
  
  // Guides operations
  getGuide(id: number): Promise<Guide | undefined>;
  getAllGuides(): Promise<Guide[]>;
  searchGuides(query: string): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: number, guide: Partial<InsertGuide>): Promise<Guide | undefined>;
  deleteGuide(id: number): Promise<boolean>;
  
  // Bookmarks operations
  getUserBookmarks(userId: string): Promise<BookmarkedGuide[]>;
  createBookmark(userId: string, guideId: number): Promise<BookmarkedGuide>;
  deleteBookmark(userId: string, guideId: number): Promise<boolean>;
  
  // Price history
  recordPrice(partId: number, price: number): Promise<void>;
  getPriceHistory(partId: number, days: number): Promise<{ price: string; recordedAt: Date }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Parts operations
  async getPart(id: number): Promise<Part | undefined> {
    const [part] = await db.select().from(parts).where(eq(parts.id, id));
    return part;
  }

  async searchParts(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
  }): Promise<Part[]> {
    let query = db.select().from(parts);
    const conditions: any[] = [];

    if (filters.type) {
      conditions.push(eq(parts.type, filters.type));
    }
    if (filters.brand) {
      conditions.push(eq(parts.brand, filters.brand));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(sql`${parts.price}::numeric >= ${filters.minPrice}`);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${parts.price}::numeric <= ${filters.maxPrice}`);
    }
    if (filters.query) {
      conditions.push(
        sql`(${parts.name} ILIKE ${'%' + filters.query + '%'} OR ${parts.description} ILIKE ${'%' + filters.query + '%'})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async createPart(part: InsertPart): Promise<Part> {
    const [newPart] = await db.insert(parts).values(part).returning();
    return newPart;
  }

  async updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined> {
    const [updated] = await db.update(parts).set(part).where(eq(parts.id, id)).returning();
    return updated;
  }

  async upsertPartByExternalId(externalId: string, part: InsertPart): Promise<Part> {
    const existing = await db.select().from(parts).where(eq(parts.externalId, externalId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(parts)
        .set({ ...part, lastUpdated: new Date() })
        .where(eq(parts.externalId, externalId))
        .returning();
      return updated;
    } else {
      const [newPart] = await db.insert(parts).values(part).returning();
      return newPart;
    }
  }

  async getPartsByType(type: string): Promise<Part[]> {
    return await db.select().from(parts).where(eq(parts.type, type));
  }

  // Saved builds operations
  async getSavedBuild(id: number): Promise<SavedBuild | undefined> {
    const [build] = await db.select().from(savedBuilds).where(eq(savedBuilds.id, id));
    return build;
  }

  async getUserBuilds(userId: string): Promise<SavedBuild[]> {
    return await db.select().from(savedBuilds).where(eq(savedBuilds.userId, userId)).orderBy(desc(savedBuilds.createdAt));
  }

  async createSavedBuild(build: InsertSavedBuild): Promise<SavedBuild> {
    const [newBuild] = await db.insert(savedBuilds).values(build).returning();
    return newBuild;
  }

  async updateSavedBuild(id: number, build: Partial<InsertSavedBuild>): Promise<SavedBuild | undefined> {
    const [updated] = await db.update(savedBuilds)
      .set({ ...build, updatedAt: new Date() })
      .where(eq(savedBuilds.id, id))
      .returning();
    return updated;
  }

  async deleteSavedBuild(id: number): Promise<boolean> {
    const result = await db.delete(savedBuilds).where(eq(savedBuilds.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPublicBuilds(): Promise<SavedBuild[]> {
    return await db.select().from(savedBuilds).where(eq(savedBuilds.isPublic, true)).orderBy(desc(savedBuilds.createdAt));
  }

  // Guides operations
  async getGuide(id: number): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide;
  }

  async getAllGuides(): Promise<Guide[]> {
    return await db.select().from(guides).orderBy(desc(guides.publishedAt));
  }

  async searchGuides(query: string): Promise<Guide[]> {
    return await db.select().from(guides)
      .where(
        sql`(${guides.title} ILIKE ${'%' + query + '%'} OR ${guides.description} ILIKE ${'%' + query + '%'})`
      )
      .orderBy(desc(guides.publishedAt));
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db.insert(guides).values(guide).returning();
    return newGuide;
  }

  async updateGuide(id: number, guide: Partial<InsertGuide>): Promise<Guide | undefined> {
    const [updated] = await db.update(guides)
      .set({ ...guide, updatedAt: new Date() })
      .where(eq(guides.id, id))
      .returning();
    return updated;
  }

  async deleteGuide(id: number): Promise<boolean> {
    const result = await db.delete(guides).where(eq(guides.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Bookmarks operations
  async getUserBookmarks(userId: string): Promise<BookmarkedGuide[]> {
    return await db.select().from(bookmarkedGuides).where(eq(bookmarkedGuides.userId, userId));
  }

  async createBookmark(userId: string, guideId: number): Promise<BookmarkedGuide> {
    const [bookmark] = await db.insert(bookmarkedGuides).values({ userId, guideId }).returning();
    return bookmark;
  }

  async deleteBookmark(userId: string, guideId: number): Promise<boolean> {
    const result = await db.delete(bookmarkedGuides)
      .where(and(eq(bookmarkedGuides.userId, userId), eq(bookmarkedGuides.guideId, guideId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Price history
  async recordPrice(partId: number, price: number): Promise<void> {
    await db.insert(priceHistory).values({ partId, price: price.toString() });
  }

  async getPriceHistory(partId: number, days: number): Promise<{ price: string; recordedAt: Date }[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db.select({
      price: priceHistory.price,
      recordedAt: priceHistory.recordedAt,
    })
    .from(priceHistory)
    .where(and(
      eq(priceHistory.partId, partId),
      sql`${priceHistory.recordedAt} >= ${cutoffDate}`
    ))
    .orderBy(priceHistory.recordedAt);
  }
}

export const storage = new DatabaseStorage();
