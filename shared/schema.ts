import { Schema, model, Document, Types, Model } from 'mongoose';
import { z } from 'zod';

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now }
});

// Part Schema
const partSchema = new Schema({
  externalId: { type: String, unique: true },
  type: { type: String, required: true, index: true },
  name: { type: String, required: true },
  brand: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  specs: { type: Schema.Types.Mixed, required: true },
  description: String,
  imageUrl: String,
  compatibility: [{ type: String }],
  pcPartPickerUrl: String,
  lastUpdated: { type: Date, default: Date.now }
});

// Saved Build Schema
const savedBuildSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  partsConfig: [{
    part: { type: Schema.Types.ObjectId, ref: 'Part' },
    type: String,
    name: String,
    price: Number
  }],
  pcPartPickerUrl: String,
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: -1 },
  updatedAt: { type: Date, default: Date.now }
});

// Guide Schema
const guideSchema = new Schema({
  category: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  readTime: String,
  publishedAt: { type: Date, default: Date.now, index: -1 },
  updatedAt: { type: Date, default: Date.now },
  tags: [{ type: String, index: true }]
});

// Bookmarked Guide Schema
const bookmarkedGuideSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  guide: { type: Schema.Types.ObjectId, ref: 'Guide', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Price History Schema
const priceHistorySchema = new Schema({
  part: { type: Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  recordedAt: { type: Date, default: Date.now, index: -1 }
});

// Add compound indexes
bookmarkedGuideSchema.index({ user: 1, guide: 1 }, { unique: true });
priceHistorySchema.index({ part: 1, recordedAt: -1 });

// Create and export models with proper typing
export const User = model<IUser>('User', userSchema) as UserModel;
export const Part = model<IPart>('Part', partSchema) as PartModel;
export const SavedBuild = model<ISavedBuild>('SavedBuild', savedBuildSchema) as SavedBuildModel;
export const Guide = model<IGuide>('Guide', guideSchema) as GuideModel;
export const BookmarkedGuide = model<IBookmarkedGuide>('BookmarkedGuide', bookmarkedGuideSchema) as BookmarkedGuideModel;
export const PriceHistory = model<IPriceHistory>('PriceHistory', priceHistorySchema) as PriceHistoryModel;

// Zod Schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(6),
  email: z.string().email().trim().toLowerCase().optional()
});

export const insertPartSchema = z.object({
  externalId: z.string().optional(),
  type: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  price: z.number().min(0),
  specs: z.record(z.union([z.string(), z.number()])),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  compatibility: z.array(z.string()).optional(),
  pcPartPickerUrl: z.string().url().optional()
});

export const insertSavedBuildSchema = z.object({
  user: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  totalPrice: z.number().min(0),
  partsConfig: z.array(z.object({
    part: z.string().min(1),
    type: z.string(),
    name: z.string(),
    price: z.number().min(0)
  })),
  pcPartPickerUrl: z.string().url().optional(),
  isPublic: z.boolean().default(false)
});

export const insertGuideSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  readTime: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Base interfaces
export interface IUserBase {
  username: string;
  password: string;
  email?: string | null;
  createdAt: Date;
}

export interface IPartBase {
  externalId?: string | null;
  type: string;
  name: string;
  brand: string;
  price: number;
  specs: Record<string, any>;
  description?: string | null;
  imageUrl?: string | null;
  compatibility: string[];
  pcPartPickerUrl?: string | null;
  lastUpdated: Date;
}

export interface ISavedBuildBase {
  user: Types.ObjectId;
  name: string;
  description?: string | null;
  category: string;
  totalPrice: number;
  partsConfig: Array<{
    part?: Types.ObjectId;
    type: string;
    name: string;
    price: number;
  }>;
  pcPartPickerUrl?: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuideBase {
  category: string;
  title: string;
  description: string;
  content: string;
  readTime: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface IBookmarkedGuideBase {
  user: Types.ObjectId;
  guide: Types.ObjectId;
  createdAt: Date;
}

export interface IPriceHistoryBase {
  part: Types.ObjectId;
  price: number;
  recordedAt: Date;
}

// Document interfaces
export interface IUser extends IUserBase, Document {}
export interface IPart extends IPartBase, Document {}
export interface ISavedBuild extends ISavedBuildBase, Document {}
export interface IGuide extends IGuideBase, Document {}
export interface IBookmarkedGuide extends IBookmarkedGuideBase, Document {}
export interface IPriceHistory extends IPriceHistoryBase, Document {}

// Model types
export type UserModel = Model<IUser>;
export type PartModel = Model<IPart>;
export type SavedBuildModel = Model<ISavedBuild>;
export type GuideModel = Model<IGuide>;
export type BookmarkedGuideModel = Model<IBookmarkedGuide>;
export type PriceHistoryModel = Model<IPriceHistory>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPart = z.infer<typeof insertPartSchema>;
export type InsertSavedBuild = z.infer<typeof insertSavedBuildSchema>;
