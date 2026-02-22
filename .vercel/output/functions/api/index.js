// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { Types as Types2 } from "mongoose";

// shared/schema.ts
import { Schema, model } from "mongoose";
import { z } from "zod";
var userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now }
});
var partSchema = new Schema({
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
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 100 },
  rating: { type: Number, min: 0, max: 5, default: 4 },
  reviewCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});
var savedBuildSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  partsConfig: [{
    part: { type: Schema.Types.ObjectId, ref: "Part" },
    type: String,
    name: String,
    price: Number
  }],
  pcPartPickerUrl: String,
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: -1 },
  updatedAt: { type: Date, default: Date.now }
});
var guideSchema = new Schema({
  category: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  readTime: String,
  publishedAt: { type: Date, default: Date.now, index: -1 },
  updatedAt: { type: Date, default: Date.now },
  tags: [{ type: String, index: true }]
});
var bookmarkedGuideSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  guide: { type: Schema.Types.ObjectId, ref: "Guide", required: true },
  createdAt: { type: Date, default: Date.now }
});
var priceHistorySchema = new Schema({
  part: { type: Schema.Types.ObjectId, ref: "Part", required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  recordedAt: { type: Date, default: Date.now, index: -1 }
});
var cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  sessionId: { type: String },
  items: [{
    part: { type: Schema.Types.ObjectId, ref: "Part", required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now }
  }],
  currency: { type: String, default: "USD" },
  region: { type: String, default: "US" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
var orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  sessionId: { type: String, index: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    part: { type: Schema.Types.ObjectId, ref: "Part", required: true },
    partName: { type: String, required: true },
    partType: { type: String, required: true },
    partBrand: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "completed" },
  billingEmailSent: { type: Boolean, default: false },
  billingEmailSentAt: { type: Date },
  billingEmailError: { type: String },
  createdAt: { type: Date, default: Date.now, index: -1 }
});
bookmarkedGuideSchema.index({ user: 1, guide: 1 }, { unique: true });
priceHistorySchema.index({ part: 1, recordedAt: -1 });
cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
var User = model("User", userSchema);
var Part = model("Part", partSchema);
var SavedBuild = model("SavedBuild", savedBuildSchema);
var Guide = model("Guide", guideSchema);
var BookmarkedGuide = model("BookmarkedGuide", bookmarkedGuideSchema);
var PriceHistory = model("PriceHistory", priceHistorySchema);
var Cart = model("Cart", cartSchema);
var Order = model("Order", orderSchema);
var insertUserSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(6),
  email: z.string().email().trim().toLowerCase().optional()
});
var insertPartSchema = z.object({
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
var insertSavedBuildSchema = z.object({
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
var insertGuideSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  readTime: z.string().optional(),
  tags: z.array(z.string()).optional()
});
var addToCartSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().int().min(1).default(1)
});
var updateCartItemSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().int().min(0)
});
var checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required")
});
var pcRequestSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  customerCity: z.string().optional(),
  customerBudget: z.number().optional(),
  customerNotes: z.string().optional(),
  items: z.array(z.object({
    partId: z.string(),
    quantity: z.number(),
    partName: z.string(),
    partType: z.string(),
    partBrand: z.string(),
    price: z.number()
  })),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  currency: z.string().default("USD")
});
var partsFilterSchema = z.object({
  type: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  query: z.string().optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(["price", "name", "rating", "brand"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

// server/storage.ts
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    return User.findById(id).lean().exec();
  }
  async getUserByUsername(username) {
    return User.findOne({ username }).lean().exec();
  }
  async createUser(user) {
    const newUser = await User.create(user);
    return newUser.toObject();
  }
  // Parts operations
  async getPart(id) {
    return Part.findById(id).lean().exec();
  }
  async searchParts(filters) {
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.brand) query.brand = filters.brand;
    if (filters.minPrice !== void 0) query.price = { ...query.price, $gte: filters.minPrice };
    if (filters.maxPrice !== void 0) query.price = { ...query.price, $lte: filters.maxPrice };
    if (filters.query) query.name = { $regex: filters.query, $options: "i" };
    return Part.find(query).lean().exec();
  }
  async createPart(part) {
    const newPart = await Part.create(part);
    return newPart.toObject();
  }
  async updatePart(id, part) {
    const updatedPart = await Part.findByIdAndUpdate(id, part, { new: true }).lean().exec();
    return updatedPart;
  }
  async upsertPartByExternalId(externalId, part) {
    const result = await Part.findOneAndUpdate(
      { externalId },
      part,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean().exec();
    if (!result) {
      throw new Error("Failed to upsert part");
    }
    return result;
  }
  async getPartsByType(type) {
    return Part.find({ type }).lean().exec();
  }
  // Saved builds operations
  async getSavedBuild(id) {
    return SavedBuild.findById(id).lean().exec();
  }
  async getUserBuilds(userId) {
    return SavedBuild.find({ user: new Types2.ObjectId(userId) }).sort({ createdAt: -1 }).lean().exec();
  }
  async createSavedBuild(build) {
    if (!build.name || !build.user || !build.category || !build.totalPrice || !build.partsConfig) {
      throw new Error("Missing required fields for saved build");
    }
    const buildToCreate = {
      ...build,
      user: build.user instanceof Types2.ObjectId ? build.user : new Types2.ObjectId(build.user),
      partsConfig: build.partsConfig.map((pc) => ({
        ...pc,
        part: pc.part ? pc.part instanceof Types2.ObjectId ? pc.part : new Types2.ObjectId(pc.part) : void 0
      }))
    };
    const newBuild = await SavedBuild.create(buildToCreate);
    return newBuild.toObject();
  }
  async updateSavedBuild(id, build) {
    const updatedBuild = await SavedBuild.findByIdAndUpdate(
      id,
      build,
      { new: true }
    ).lean().exec();
    return updatedBuild;
  }
  async deleteSavedBuild(id) {
    const result = await SavedBuild.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
  async getPublicBuilds() {
    return SavedBuild.find({ isPublic: true }).sort({ createdAt: -1 }).populate("user", "username").lean().exec();
  }
  // Guides operations
  async getGuide(id) {
    return Guide.findById(id).lean().exec();
  }
  async getAllGuides() {
    return Guide.find().lean().exec();
  }
  async searchGuides(query) {
    return Guide.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } }
      ]
    }).lean().exec();
  }
  async createGuide(guide) {
    const newGuide = await Guide.create(guide);
    return newGuide.toObject();
  }
  async updateGuide(id, guide) {
    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      { ...guide, updatedAt: /* @__PURE__ */ new Date() },
      { new: true }
    ).lean().exec();
    return updatedGuide;
  }
  async deleteGuide(id) {
    const result = await Guide.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
  // Bookmarks operations
  async getUserBookmarks(userId) {
    return BookmarkedGuide.find({ user: new Types2.ObjectId(userId) }).populate("guide").sort({ createdAt: -1 }).lean().exec();
  }
  async createBookmark(userId, guideId) {
    const bookmark = new BookmarkedGuide({
      user: new Types2.ObjectId(userId),
      guide: new Types2.ObjectId(guideId)
    });
    const savedBookmark = await bookmark.save();
    return savedBookmark.toObject();
  }
  async deleteBookmark(userId, guideId) {
    const result = await BookmarkedGuide.deleteOne({
      user: new Types2.ObjectId(userId),
      guide: new Types2.ObjectId(guideId)
    }).exec();
    return result.deletedCount > 0;
  }
  // Price history
  async recordPrice(partId, price) {
    await PriceHistory.create({
      part: new Types2.ObjectId(partId),
      price,
      recordedAt: /* @__PURE__ */ new Date()
    });
  }
  async getPriceHistory(partId, days) {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - days);
    const history = await PriceHistory.find({
      part: new Types2.ObjectId(partId),
      recordedAt: { $gte: date }
    }).sort({ recordedAt: 1 }).lean().exec();
    return history.map((item) => ({
      price: item.price.toString(),
      recordedAt: item.recordedAt
    }));
  }
  async searchPartsAdvanced(filters) {
    const mongoQuery = {};
    if (filters.type) mongoQuery.type = filters.type;
    if (filters.brand) mongoQuery.brand = filters.brand;
    if (filters.minPrice !== void 0) mongoQuery.price = { ...mongoQuery.price, $gte: filters.minPrice };
    if (filters.maxPrice !== void 0) mongoQuery.price = { ...mongoQuery.price, $lte: filters.maxPrice };
    if (filters.query) {
      mongoQuery.$or = [
        { name: { $regex: filters.query, $options: "i" } },
        { brand: { $regex: filters.query, $options: "i" } },
        { description: { $regex: filters.query, $options: "i" } }
      ];
    }
    if (filters.inStock !== void 0) mongoQuery.inStock = filters.inStock;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const sortField = filters.sortBy || "name";
    const sortOrder = filters.sortOrder === "desc" ? -1 : 1;
    const [parts, total] = await Promise.all([
      Part.find(mongoQuery).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean().exec(),
      Part.countDocuments(mongoQuery).exec()
    ]);
    return {
      parts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  async getPartsByIds(ids) {
    const objectIds = ids.map((id) => new Types2.ObjectId(id));
    return Part.find({ _id: { $in: objectIds } }).lean().exec();
  }
  async getAllBrands() {
    return Part.distinct("brand").exec();
  }
  async getAllPartTypes() {
    return Part.distinct("type").exec();
  }
  async getCart(userId, sessionId) {
    const query = {};
    if (userId) query.user = new Types2.ObjectId(userId);
    else if (sessionId) query.sessionId = sessionId;
    else return null;
    return Cart.findOne(query).lean().exec();
  }
  async getOrCreateCart(userId, sessionId) {
    const existingCart = await this.getCart(userId, sessionId);
    if (existingCart) return existingCart;
    const newCart = await Cart.create({
      user: userId ? new Types2.ObjectId(userId) : void 0,
      sessionId: sessionId || void 0,
      items: [],
      currency: "USD",
      region: "US"
    });
    return newCart.toObject();
  }
  async addToCart(cartId, partId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");
    const existingItem = cart.items.find(
      (item) => item.part.toString() === partId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        part: new Types2.ObjectId(partId),
        quantity,
        addedAt: /* @__PURE__ */ new Date()
      });
    }
    cart.updatedAt = /* @__PURE__ */ new Date();
    await cart.save();
    return cart.toObject();
  }
  async updateCartItem(cartId, partId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");
    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.part.toString() !== partId);
    } else {
      const item = cart.items.find((item2) => item2.part.toString() === partId);
      if (item) {
        item.quantity = quantity;
      }
    }
    cart.updatedAt = /* @__PURE__ */ new Date();
    await cart.save();
    return cart.toObject();
  }
  async removeFromCart(cartId, partId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");
    cart.items = cart.items.filter((item) => item.part.toString() !== partId);
    cart.updatedAt = /* @__PURE__ */ new Date();
    await cart.save();
    return cart.toObject();
  }
  async clearCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");
    cart.items = [];
    cart.updatedAt = /* @__PURE__ */ new Date();
    await cart.save();
    return cart.toObject();
  }
  async getCartWithParts(cartId) {
    const cart = await Cart.findById(cartId).lean().exec();
    if (!cart) return null;
    const partIds = cart.items.map((item) => item.part.toString());
    const parts = await this.getPartsByIds(partIds);
    return { cart, parts };
  }
  // Order operations
  async createOrder(order) {
    const newOrder = await Order.create(order);
    return newOrder.toObject();
  }
  async getOrder(id) {
    return Order.findById(id).lean().exec();
  }
  async getOrderByNumber(orderNumber) {
    return Order.findOne({ orderNumber }).lean().exec();
  }
  async updateOrder(id, updates) {
    return Order.findByIdAndUpdate(id, updates, { new: true }).lean().exec();
  }
  async getUserOrders(userId) {
    return Order.find({ user: new Types2.ObjectId(userId) }).sort({ createdAt: -1 }).lean().exec();
  }
};
var storage = new DatabaseStorage();

// server/ai/recommendation-engine.ts
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
var ai = perplexity("sonar-medium-online");
async function generateRecommendation(request) {
  const allParts = await storage.searchParts({});
  const cpus = allParts.filter((p) => p.type === "cpu");
  const gpus = allParts.filter((p) => p.type === "gpu");
  const rams = allParts.filter((p) => p.type === "ram");
  const storageParts = allParts.filter((p) => p.type === "storage");
  const motherboards = allParts.filter((p) => p.type === "motherboard");
  const psus = allParts.filter((p) => p.type === "psu");
  const cases = allParts.filter((p) => p.type === "case");
  const prompt = `You are an expert PC builder. Given the following requirements, recommend the best PC build:

Budget: $${request.budget}
Use Case: ${request.useCase}
Performance Level: ${request.performance}
${request.brands?.length ? `Preferred Brands: ${request.brands.join(", ")}` : ""}

Available parts database:
CPUs: ${JSON.stringify(cpus.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
GPUs: ${JSON.stringify(gpus.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
RAM: ${JSON.stringify(rams.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Storage: ${JSON.stringify(storageParts.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Motherboards: ${JSON.stringify(motherboards.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
PSUs: ${JSON.stringify(psus.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Cases: ${JSON.stringify(cases.map((p) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}

Please return a JSON response with the following structure:
{
  "name": "Build name (creative and descriptive)",
  "description": "Brief description of what this build excels at",
  "category": "gaming|workstation|budget|streaming",
  "selectedParts": {
    "cpu": part_id,
    "gpu": part_id,
    "ram": part_id,
    "storage": part_id,
    "motherboard": part_id,
    "psu": part_id,
    "case": part_id
  },
  "reasoning": {
    "cpu": "Why this CPU was chosen",
    "gpu": "Why this GPU was chosen",
    "ram": "Why this RAM was chosen",
    "storage": "Why this storage was chosen",
    "motherboard": "Why this motherboard was chosen",
    "psu": "Why this PSU was chosen",
    "case": "Why this case was chosen"
  },
  "alternatives": {
    "cpu": [part_id, part_id],
    "gpu": [part_id, part_id]
  }
}

Ensure compatibility between parts (CPU socket matching motherboard, PSU wattage sufficient, etc.). Stay as close to the budget as possible without exceeding it. Prioritize value and performance for the stated use case.`;
  try {
    const { text } = await generateText({
      model: ai,
      messages: [
        { role: "system", content: "You are an expert PC builder. Provide detailed recommendations and reasoning for PC part selections. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });
    if (!text) {
      throw new Error("No response from AI");
    }
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [text];
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonString);
    const buildRecommendation = {
      name: result.name,
      description: result.description,
      category: result.category,
      totalPrice: result.totalPrice || 0,
      parts: [],
      reasoning: result.reasoning,
      alternatives: {}
    };
    const partIds = [
      result.selectedParts.cpu,
      result.selectedParts.gpu,
      result.selectedParts.ram,
      result.selectedParts.storage,
      result.selectedParts.motherboard,
      result.selectedParts.psu,
      result.selectedParts.case,
      ...result.alternatives?.cpu || [],
      ...result.alternatives?.gpu || []
    ].filter(Boolean);
    const parts = await Promise.all(
      partIds.map((id) => storage.getPart(id))
    );
    const partMap = new Map(parts.filter((part) => part !== null).map((part) => [part._id.toString(), part]));
    const selectedParts = [
      partMap.get(result.selectedParts.cpu),
      partMap.get(result.selectedParts.gpu),
      partMap.get(result.selectedParts.ram),
      partMap.get(result.selectedParts.storage),
      partMap.get(result.selectedParts.motherboard),
      partMap.get(result.selectedParts.psu),
      partMap.get(result.selectedParts.case)
    ].filter((part) => part !== void 0);
    buildRecommendation.parts = selectedParts;
    if (result.alternatives) {
      for (const [partType, alternativeIds] of Object.entries(result.alternatives)) {
        const alternatives = alternativeIds.map((id) => partMap.get(id)).filter((part) => part !== void 0);
        buildRecommendation.alternatives[partType] = alternatives;
      }
    }
    buildRecommendation.totalPrice = buildRecommendation.parts.reduce(
      (sum, part) => sum + part.price,
      0
    );
    return buildRecommendation;
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw new Error("Failed to generate recommendation. Please try again later.");
  }
}
async function compareParts(partIds) {
  if (partIds.length < 2) {
    throw new Error("At least two part IDs are required for comparison");
  }
  const parts = await Promise.all(
    partIds.map((id) => storage.getPart(id))
  );
  const partDetails = parts.filter((part) => part !== null).map((part) => ({
    id: part._id.toString(),
    name: part.name,
    type: part.type,
    brand: part.brand,
    price: part.price,
    specs: part.specs
  }));
  const prompt = `Compare the following PC parts and determine which one is the best based on performance, value, and specifications. Return a JSON object with a detailed comparison, a winner, and reasoning.

Parts to compare:
${JSON.stringify(partDetails, null, 2)}

Respond with a JSON object in this format:
{
  "comparison": {
    "performance": "Detailed comparison of performance",
    "value": "Detailed comparison of value for money",
    "features": "Detailed comparison of features"
  },
  "winner": "part_id",
  "reasoning": "Detailed explanation of why this part was chosen as the winner"
}`;
  try {
    const { text } = await generateText({
      model: ai,
      messages: [
        { role: "system", content: "You are an expert at comparing PC hardware. Provide detailed comparisons and reasoning for your recommendations. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });
    if (!text) {
      throw new Error("No response from AI");
    }
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [text];
    const jsonString = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error comparing parts:", error);
    throw new Error("Failed to compare parts. Please try again later.");
  }
}

// server/routes.ts
import { WebSocketServer } from "ws";
import bcrypt from "bcryptjs";
import { Types as Types3 } from "mongoose";

// server/email.ts
import nodemailer from "nodemailer";
var BILLING_EMAIL = "ctechmtv@gmail.com";
var SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || BILLING_EMAIL;
var transporter = null;
function getNodemailerTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || "ctechmtv@gmail.com",
        pass: process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}
function generateOrderEmailHtml(order) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation #${order.orderNumber}</h2>
      <p>Thank you for your order, ${order.customerName}!</p>
      <!-- Add more HTML content as needed -->
    </div>
  `;
}
function generateOrderEmailText(order) {
  return `
    Order Confirmation #${order.orderNumber}
    Thank you for your order, ${order.customerName}!
    // Add more text content as needed
  `;
}
function generatePCRequestEmailHtml(request) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New PC Build Request</h2>
      <p>Customer: ${request.customerName}</p>
      <!-- Add more HTML content as needed -->
    </div>
  `;
}
async function sendBillingEmail(order) {
  try {
    const transporter3 = getNodemailerTransporter();
    const mailOptions = {
      from: process.env.GMAIL_USER || "ctechmtv@gmail.com",
      to: BILLING_EMAIL,
      subject: `Order Confirmation #${order.orderNumber} - PC Guide Pro`,
      html: generateOrderEmailHtml(order),
      text: generateOrderEmailText(order),
      replyTo: order.customerEmail
    };
    const info = await transporter3.sendMail(mailOptions);
    console.log(`Billing email sent successfully for order ${order.orderNumber}, messageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err) {
    console.error("Error sending billing email:", err);
    return {
      success: false,
      error: err.message || "Unknown error sending email"
    };
  }
}
async function sendPCRequestEmail(request) {
  try {
    const transporter3 = getNodemailerTransporter();
    const mailOptions = {
      from: process.env.GMAIL_USER || "ctechmtv@gmail.com",
      to: BILLING_EMAIL,
      subject: `New PC Build Request \u2013 ${request.customerName}`,
      html: generatePCRequestEmailHtml(request),
      replyTo: request.customerEmail
    };
    const info = await transporter3.sendMail(mailOptions);
    console.log(`PC request email sent successfully, messageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err) {
    console.error("Error sending PC request email:", err);
    return {
      success: false,
      error: err.message || "Unknown error sending email"
    };
  }
}
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PCG-${timestamp}-${random}`;
}

// server/routes.ts
async function registerRoutes(app2) {
  const requireAuth = (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });
      req.session.userId = user._id.toString();
      res.json({ id: user._id.toString(), username: user.username });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user._id.toString();
      res.json({ id: user._id.toString(), username: user.username });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: user._id.toString(), username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/parts", async (req, res) => {
    try {
      const { type, brand, minPrice, maxPrice, query } = req.query;
      const parts = await storage.searchParts({
        type,
        brand,
        minPrice: minPrice ? parseFloat(minPrice) : void 0,
        maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
        query
      });
      res.json(parts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/parts/browse", async (req, res) => {
    try {
      const filters = {
        type: req.query.type,
        brand: req.query.brand,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : void 0,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : void 0,
        query: req.query.query,
        inStock: req.query.inStock === "true" ? true : req.query.inStock === "false" ? false : void 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };
      const result = await storage.searchPartsAdvanced(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/parts/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/parts/types", async (req, res) => {
    try {
      const types = await storage.getAllPartTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/parts/batch", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }
      const parts = await storage.getPartsByIds(ids);
      res.json(parts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/parts/:id", async (req, res) => {
    try {
      const part = await storage.getPart(req.params.id);
      if (!part) {
        return res.status(404).json({ error: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/parts", async (req, res) => {
    try {
      const data = insertPartSchema.parse(req.body);
      const part = await storage.createPart(data);
      res.status(201).json(part);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/parts/:id/price-history", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const history = await storage.getPriceHistory(req.params.id, days);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/recommend", async (req, res) => {
    try {
      const { budget, useCase, performance, brands } = req.body;
      if (!budget || !useCase || !performance) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const recommendation = await generateRecommendation({
        budget: parseFloat(budget),
        useCase,
        performance,
        brands
      });
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/compare", async (req, res) => {
    try {
      const { partIds } = req.body;
      if (!Array.isArray(partIds) || partIds.length < 2) {
        return res.status(400).json({ error: "Need at least 2 part IDs to compare" });
      }
      const result = await compareParts(partIds);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/builds", requireAuth, async (req, res) => {
    try {
      const builds = await storage.getUserBuilds(req.session.userId);
      res.json(builds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/builds/public", async (req, res) => {
    try {
      const builds = await storage.getPublicBuilds();
      res.json(builds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/builds/:id", async (req, res) => {
    try {
      const build = await storage.getSavedBuild(req.params.id);
      if (!build) {
        return res.status(404).json({ error: "Build not found" });
      }
      res.json(build);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/builds", requireAuth, async (req, res) => {
    try {
      const buildData = insertSavedBuildSchema.parse({
        ...req.body,
        user: req.session.userId
      });
      const buildToCreate = {
        ...buildData,
        user: new Types3.ObjectId(buildData.user),
        partsConfig: buildData.partsConfig.map((pc) => ({
          ...pc,
          part: new Types3.ObjectId(pc.part)
        }))
      };
      const build = await storage.createSavedBuild(buildToCreate);
      res.status(201).json(build);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/builds/:id", requireAuth, async (req, res) => {
    try {
      const build = await storage.getSavedBuild(req.params.id);
      if (!build || build.user.toString() !== req.session.userId) {
        return res.status(404).json({ error: "Build not found" });
      }
      const updated = await storage.updateSavedBuild(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/builds/:id", requireAuth, async (req, res) => {
    try {
      const build = await storage.getSavedBuild(req.params.id);
      if (!build || build.user.toString() !== req.session.userId) {
        return res.status(404).json({ error: "Build not found" });
      }
      await storage.deleteSavedBuild(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/guides", async (req, res) => {
    try {
      const { query } = req.query;
      const guides = query ? await storage.searchGuides(query) : await storage.getAllGuides();
      res.json(guides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ error: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/guides", async (req, res) => {
    try {
      const data = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(data);
      res.status(201).json(guide);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/guides/:id", async (req, res) => {
    try {
      const updated = await storage.updateGuide(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Guide not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/guides/:id", async (req, res) => {
    try {
      await storage.deleteGuide(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.session.userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const { guideId } = req.body;
      const bookmark = await storage.createBookmark(req.session.userId, guideId);
      res.status(201).json(bookmark);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/bookmarks/:guideId", requireAuth, async (req, res) => {
    try {
      await storage.deleteBookmark(req.session.userId, req.params.guideId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/cart", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getOrCreateCart(userId, sessionId);
      if (!cart) {
        return res.json({ items: [], total: 0 });
      }
      const cartWithParts = await storage.getCartWithParts(cart._id.toString());
      if (!cartWithParts) {
        return res.json({ items: [], total: 0 });
      }
      const { cart: cartData, parts } = cartWithParts;
      const partsMap = new Map(parts.map((p) => [p._id.toString(), p]));
      const items = cartData.items.map((item) => {
        const part = partsMap.get(item.part.toString());
        return {
          partId: item.part.toString(),
          quantity: item.quantity,
          part: part || null
        };
      }).filter((item) => item.part !== null);
      const total = items.reduce(
        (sum, item) => sum + (item.part?.price || 0) * item.quantity,
        0
      );
      res.json({
        id: cartData._id,
        items,
        total,
        currency: cartData.currency,
        region: cartData.region,
        itemCount: items.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/cart/add", async (req, res) => {
    try {
      const { partId, quantity = 1 } = req.body;
      if (!partId) {
        return res.status(400).json({ error: "partId is required" });
      }
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getOrCreateCart(userId, sessionId);
      await storage.addToCart(cart._id.toString(), partId, quantity);
      res.json({ success: true, message: "Item added to cart" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/cart/update", async (req, res) => {
    try {
      const { partId, quantity } = req.body;
      if (!partId || quantity === void 0) {
        return res.status(400).json({ error: "partId and quantity are required" });
      }
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getCart(userId, sessionId);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      await storage.updateCartItem(cart._id.toString(), partId, quantity);
      res.json({ success: true, message: "Cart updated" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/cart/remove/:partId", async (req, res) => {
    try {
      const { partId } = req.params;
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getCart(userId, sessionId);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      await storage.removeFromCart(cart._id.toString(), partId);
      res.json({ success: true, message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/cart/clear", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getCart(userId, sessionId);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      await storage.clearCart(cart._id.toString());
      res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/checkout/complete", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const checkoutData = checkoutSchema.parse(req.body);
      const cart = await storage.getCart(userId, sessionId);
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      const cartWithParts = await storage.getCartWithParts(cart._id.toString());
      if (!cartWithParts) {
        return res.status(400).json({ error: "Failed to retrieve cart items" });
      }
      const { parts } = cartWithParts;
      const partsMap = new Map(parts.map((p) => [p._id.toString(), p]));
      const orderItems = cart.items.map((item) => {
        const part = partsMap.get(item.part.toString());
        if (!part) {
          throw new Error(`Part ${item.part.toString()} not found`);
        }
        return {
          part: item.part,
          partName: part.name,
          partType: part.type,
          partBrand: part.brand,
          price: part.price,
          quantity: item.quantity
        };
      });
      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.0825;
      const total = subtotal + tax;
      const orderNumber = generateOrderNumber();
      const order = await storage.createOrder({
        orderNumber,
        user: userId ? new Types3.ObjectId(userId) : void 0,
        sessionId,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        items: orderItems,
        subtotal,
        tax,
        total,
        currency: cart.currency || "USD",
        status: "completed",
        billingEmailSent: false,
        createdAt: /* @__PURE__ */ new Date()
      });
      const emailResult = await sendBillingEmail({
        orderNumber,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        items: orderItems.map((item) => ({
          partName: item.partName,
          partType: item.partType,
          partBrand: item.partBrand,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        tax,
        total,
        currency: cart.currency || "USD",
        createdAt: /* @__PURE__ */ new Date()
      });
      await storage.updateOrder(order._id.toString(), {
        billingEmailSent: emailResult.success,
        billingEmailSentAt: emailResult.success ? /* @__PURE__ */ new Date() : void 0,
        billingEmailError: emailResult.error
      });
      await storage.clearCart(cart._id.toString());
      res.json({
        success: true,
        orderNumber,
        total,
        subtotal,
        tax,
        currency: cart.currency || "USD",
        itemCount: orderItems.length,
        emailSent: emailResult.success,
        emailError: emailResult.success ? void 0 : emailResult.error,
        message: emailResult.success ? `Receipt emailed to ctechmtv@gmail.com` : "Order completed but email could not be sent. Please contact support."
      });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/pc-request", async (req, res) => {
    try {
      const requestData = pcRequestSchema.parse(req.body);
      const emailResult = await sendPCRequestEmail({
        customerName: requestData.customerName,
        customerEmail: requestData.customerEmail,
        customerPhone: requestData.customerPhone,
        customerCity: requestData.customerCity,
        customerBudget: requestData.customerBudget,
        customerNotes: requestData.customerNotes,
        items: requestData.items.map((item) => ({
          partName: item.partName,
          partType: item.partType,
          partBrand: item.partBrand,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: requestData.subtotal,
        tax: requestData.tax,
        total: requestData.total,
        currency: requestData.currency
      });
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getCart(userId, sessionId);
      if (cart) {
        await storage.clearCart(cart._id.toString());
      }
      res.json({
        success: true,
        message: "Your PC request has been sent to an expert builder. We will contact you through your email soon.",
        emailSent: emailResult.success,
        emailError: emailResult.success ? void 0 : emailResult.error
      });
    } catch (error) {
      console.error("PC request error:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/compatibility/check", async (req, res) => {
    try {
      const { partIds } = req.body;
      if (!Array.isArray(partIds) || partIds.length === 0) {
        return res.status(400).json({ error: "partIds must be a non-empty array" });
      }
      const parts = await storage.getPartsByIds(partIds);
      const issues = [];
      let compatible = true;
      const cpu = parts.find((p) => p.type === "cpu");
      const motherboard = parts.find((p) => p.type === "motherboard");
      const ram = parts.find((p) => p.type === "ram");
      const gpu = parts.find((p) => p.type === "gpu");
      const psu = parts.find((p) => p.type === "psu");
      const cooler = parts.find((p) => p.type === "cooling");
      if (cpu && motherboard) {
        const cpuSocket = cpu.specs?.socket;
        const moboSocket = motherboard.specs?.socket;
        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
          issues.push(`CPU socket (${cpuSocket}) is not compatible with motherboard socket (${moboSocket})`);
          compatible = false;
        }
      }
      if (ram && motherboard) {
        const ramType = ram.specs?.type;
        const moboMemoryType = motherboard.specs?.memoryType;
        if (ramType && moboMemoryType && ramType !== moboMemoryType) {
          issues.push(`RAM type (${ramType}) is not compatible with motherboard memory type (${moboMemoryType})`);
          compatible = false;
        }
      }
      if (cpu && cooler) {
        const cpuSocket = cpu.specs?.socket;
        const coolerCompatibility = cooler.compatibility || [];
        if (cpuSocket && coolerCompatibility.length > 0 && !coolerCompatibility.includes(cpuSocket)) {
          issues.push(`CPU cooler may not be compatible with ${cpuSocket} socket`);
          compatible = false;
        }
      }
      if (psu) {
        let estimatedPower = 100;
        if (cpu) estimatedPower += 125;
        if (gpu && gpu.specs?.tdp) {
          estimatedPower += typeof gpu.specs.tdp === "number" ? gpu.specs.tdp : parseInt(gpu.specs.tdp);
        }
        const psuWattage = typeof psu.specs?.wattage === "number" ? psu.specs.wattage : parseInt(psu.specs?.wattage?.replace("W", "") || "0");
        if (psuWattage > 0 && estimatedPower > psuWattage * 0.8) {
          issues.push(`PSU (${psuWattage}W) may be insufficient for estimated power draw (~${estimatedPower}W). Consider 20% headroom.`);
        }
      }
      res.json({
        compatible,
        issues,
        checkedParts: parts.map((p) => ({ id: p._id, name: p.name, type: p.type }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "subscribe" && data.partIds) {
          ws.send(JSON.stringify({ type: "subscribed", partIds: data.partIds }));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  app2.locals.broadcastPriceUpdate = (partId, newPrice) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "price_update",
          partId,
          price: newPrice,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    });
  };
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  root: resolve(__dirname, "client"),
  server: {
    port: 5e3,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5e3,
      clientPort: 5e3
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets")
    }
  },
  build: {
    outDir: resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// src/features/support/api/support.routes.ts
import { Router } from "express";
import { z as z3 } from "zod";

// src/features/support/services/supportService.ts
import nodemailer2 from "nodemailer";
import { z as z2 } from "zod";
console.log("Email Configuration:", {
  gmailUser: process.env.GMAIL_USER ? "Set" : "Not Set",
  supportEmail: process.env.SUPPORT_EMAIL || "Using default",
  nodeEnv: process.env.NODE_ENV || "development"
});
var transporter2 = nodemailer2.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "ctechmtv@gmail.com",
    pass: process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
  }
});
var SupportTicketSchema = z2.object({
  name: z2.string().min(1, "Name is required"),
  email: z2.string().email("Invalid email address"),
  subject: z2.string().min(1, "Subject is required"),
  message: z2.string().min(1, "Message is required"),
  priority: z2.enum(["low", "medium", "high"]).default("medium"),
  category: z2.string().optional(),
  sendConfirmation: z2.boolean().default(true)
});
var SupportService = class {
  transporter;
  constructor() {
    this.transporter = transporter2;
  }
  formatSupportEmail(ticket) {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "full",
      timeStyle: "long"
    });
    return `
      New Support Ticket:
      ------------------
      Time: ${timestamp}
      From: ${ticket.name} <${ticket.email}>
      Subject: ${ticket.subject}
      Priority: ${ticket.priority}
      ${ticket.category ? `Category: ${ticket.category}` : ""}
      
      Message:
      ${ticket.message}
    `.trim();
  }
  formatConfirmationEmail(ticket) {
    return `
      Thank you for contacting PC Guide Pro Support!
      
      We've received your support ticket and our team will get back to you as soon as possible.
      
      Ticket Details:
      - Ticket ID: ${Date.now()}
      - Subject: ${ticket.subject}
      - Priority: ${ticket.priority}
      ${ticket.category ? `- Category: ${ticket.category}` : ""}
      
      Your Message:
      ${ticket.message}
      
      Best regards,
      PC Guide Pro Support Team
      
      ---
      This is an automated confirmation. Please do not reply unless you have additional information to add to your request.
    `.trim();
  }
  async createTicket(ticket) {
    try {
      const validatedTicket = SupportTicketSchema.parse(ticket);
      const supportEmail = process.env.SUPPORT_EMAIL || "ctechmtv@gmail.com";
      const fromEmail = process.env.GMAIL_USER || "ctechmtv@gmail.com";
      await this.transporter.sendMail({
        from: `"PC Guide Pro Support" <${fromEmail}>`,
        to: supportEmail,
        replyTo: validatedTicket.email,
        subject: `[${validatedTicket.priority.toUpperCase()}] Support Ticket: ${validatedTicket.subject}`,
        text: this.formatSupportEmail(validatedTicket)
      });
      if (validatedTicket.sendConfirmation) {
        await this.transporter.sendMail({
          from: `"PC Guide Pro Support" <${fromEmail}>`,
          to: validatedTicket.email,
          subject: `Support Ticket Received: ${validatedTicket.subject}`,
          text: this.formatConfirmationEmail(validatedTicket)
        });
      }
      console.log("Support ticket created and notifications sent");
    } catch (error) {
      console.error("Error creating support ticket:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create support ticket: ${errorMessage}`);
    }
  }
};
var supportService = new SupportService();

// src/middleware/validateRequest.ts
import { ZodError } from "zod";
function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation error",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// src/features/support/api/support.routes.ts
var router = Router();
router.post(
  "/tickets",
  validateRequest({
    body: z3.object({
      name: z3.string().min(1, "Name is required"),
      email: z3.string().email("Invalid email address"),
      subject: z3.string().min(1, "Subject is required"),
      message: z3.string().min(1, "Message is required"),
      priority: z3.enum(["low", "medium", "high"]).default("medium"),
      category: z3.string().optional(),
      sendConfirmation: z3.boolean().default(true)
    })
  }),
  async (req, res, next) => {
    try {
      await supportService.createTicket(req.body);
      res.status(201).json({
        success: true,
        message: "Support ticket submitted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);
router.get("/faq/categories", (req, res) => {
  res.json([
    { id: "getting-started", name: "Getting Started" },
    { id: "pc-building", name: "PC Building" },
    { id: "compatibility", name: "Compatibility" },
    { id: "troubleshooting", name: "Troubleshooting" },
    { id: "account", name: "Account & Settings" }
  ]);
});
router.get("/faq", (req, res) => {
  res.json({
    categories: [
      {
        id: "getting-started",
        name: "Getting Started",
        faqs: [
          {
            id: "gs-1",
            question: "How do I start building my PC with PC Guide Pro?",
            answer: 'Click on "PC Builder" in the navigation menu or the "Start Your Build" button on the homepage. You can choose a preset (Gaming, Workstation, or Budget) or start from scratch. Our smart compatibility checker will guide you through selecting compatible components.'
          },
          {
            id: "gs-2",
            question: "Do I need technical knowledge to use this tool?",
            answer: "No! PC Guide Pro is designed for users of all skill levels. We provide detailed explanations, compatibility checks, and recommendations. Our guides section also includes beginner-friendly tutorials for first-time builders."
          },
          {
            id: "gs-3",
            question: "Is PC Guide Pro free to use?",
            answer: "Yes, PC Guide Pro is completely free to use. All features including the PC Builder, comparison tools, and guides are available at no cost."
          }
        ]
      },
      {
        id: "pc-building",
        name: "PC Building",
        faqs: [
          {
            id: "pb-1",
            question: "What components do I need for a complete PC build?",
            answer: "A complete PC build typically requires: CPU (processor), GPU (graphics card), motherboard, RAM (memory), storage (SSD/HDD), power supply (PSU), and a case. Depending on your CPU, you may also need a CPU cooler. Our builder ensures you select all necessary components."
          },
          {
            id: "pb-2",
            question: "How do I know if my components are compatible?",
            answer: "PC Guide Pro automatically checks compatibility as you select components. We verify socket types, RAM compatibility, power requirements, and physical dimensions. Any potential issues are flagged immediately with explanations and alternatives."
          },
          {
            id: "pb-3",
            question: "What is the difference between Gaming and Workstation builds?",
            answer: "Gaming builds prioritize high frame rates and visual quality with powerful GPUs and fast memory. Workstation builds focus on multi-core performance for tasks like video editing, 3D rendering, and software development, often featuring more cores and higher RAM capacity."
          },
          {
            id: "pb-4",
            question: "How much should I budget for a gaming PC?",
            answer: "Budget gaming PCs start around $500-700 for 1080p gaming. Mid-range builds ($1000-1500) handle 1440p well. High-end builds ($2000+) are ideal for 4K gaming and future-proofing. Use our Budget preset to find the best value for your price range."
          }
        ]
      },
      {
        id: "compatibility",
        name: "Compatibility",
        faqs: [
          {
            id: "cp-1",
            question: "Why does my CPU need a specific motherboard socket?",
            answer: "CPUs are designed to fit specific socket types. Intel uses sockets like LGA 1700 or LGA 1200, while AMD uses AM4 or AM5. The motherboard socket must match your CPU for it to physically fit and function properly."
          },
          {
            id: "cp-2",
            question: "What is RAM compatibility and why does it matter?",
            answer: "RAM must be compatible with your motherboard in terms of type (DDR4 vs DDR5), speed, and maximum capacity. Incompatible RAM either will not work at all or may run at reduced speeds, limiting performance."
          },
          {
            id: "cp-3",
            question: "How do I know if my GPU will fit in my case?",
            answer: "Check your case specifications for maximum GPU length, and compare it to your graphics card dimensions. Our builder automatically checks this, flagging any cases that cannot accommodate your selected GPU."
          },
          {
            id: "cp-4",
            question: "What wattage power supply do I need?",
            answer: "We calculate the total power draw of your components and recommend a PSU with adequate headroom (typically 20-30% above calculated usage). This ensures stable operation and allows for future upgrades."
          }
        ]
      },
      {
        id: "troubleshooting",
        name: "Troubleshooting",
        faqs: [
          {
            id: "ts-1",
            question: "My PC will not POST (Power On Self Test). What should I check?",
            answer: "Common causes include: 1) RAM not seated properly - reseat your memory sticks firmly. 2) CPU power cable not connected - ensure the 4/8-pin CPU power is plugged in. 3) Front panel connectors wrong - double-check power switch pins. 4) GPU not seated - reseat your graphics card. Try booting with minimal components (CPU, one RAM stick, no GPU) to isolate the issue."
          },
          {
            id: "ts-2",
            question: "My system is overheating. How can I fix this?",
            answer: "Check that: 1) All fans are working and properly oriented (intake/exhaust). 2) CPU cooler is mounted correctly with thermal paste applied. 3) Cable management is not blocking airflow. 4) Dust is not clogging filters or heatsinks. Consider adding more case fans or upgrading your CPU cooler if temperatures remain high."
          },
          {
            id: "ts-3",
            question: "Why is my computer randomly shutting down?",
            answer: "This often indicates: 1) Overheating - check temperatures with monitoring software. 2) Insufficient PSU wattage - verify your power supply meets system requirements. 3) RAM issues - run Windows Memory Diagnostic. 4) Driver problems - update or rollback recent driver changes."
          },
          {
            id: "ts-4",
            question: "My new GPU is not being detected. What should I do?",
            answer: "Try these steps: 1) Reseat the GPU firmly in the PCIe slot. 2) Connect required PCIe power cables from your PSU. 3) Make sure your monitor is connected to the GPU, not motherboard. 4) Update motherboard BIOS if using newer hardware. 5) Try the GPU in a different PCIe slot if available."
          },
          {
            id: "ts-5",
            question: "How do I troubleshoot blue screen errors (BSOD)?",
            answer: "Note the error code displayed. Common causes: BAD_POOL_HEADER often means driver issues, MEMORY_MANAGEMENT suggests RAM problems, KERNEL_SECURITY_CHECK can indicate driver conflicts. Run Driver Verifier, check for Windows updates, and test RAM with MemTest86+."
          }
        ]
      },
      {
        id: "account",
        name: "Account & Settings",
        faqs: [
          {
            id: "ac-1",
            question: "How do I save my PC build?",
            answer: "Your builds are saved automatically in your browser. For cloud sync across devices, you can export your build configuration as a shareable link. This allows you to access your builds from anywhere."
          },
          {
            id: "ac-2",
            question: "Can I share my build with others?",
            answer: 'Yes! Each build has a unique shareable link. Click the "Share" button on your completed build to copy the link. Recipients can view your component list and even use it as a starting point for their own build.'
          },
          {
            id: "ac-3",
            question: "How do I contact support?",
            answer: "Use the contact form on this page to submit a support request. Include your email, describe your issue in detail, and select an appropriate priority level. We typically respond within 24-48 hours."
          }
        ]
      }
    ]
  });
});
var support_routes_default = router;

// server/index.ts
import cors from "cors";
import http from "http";
var requiredEnvVars = ["PERPLEXITY_API_KEY", "SUPPORT_EMAIL"];
var missingEnvVars = requiredEnvVars.filter((env) => !process.env[env]);
if (process.env.NODE_ENV === "development") {
  console.log("Email service:", process.env.GMAIL_USER ? "Configured" : "Using test account");
}
if (missingEnvVars.length > 0) {
  if (process.env.NODE_ENV === "production") {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
  } else {
    console.warn(`Warning: Missing environment variables (AI/email features will be limited): ${missingEnvVars.join(", ")}`);
  }
}
var app = express2();
app.use(cors());
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalJson = res.json;
  res.json = function(body) {
    capturedJsonResponse = body;
    return originalJson.call(this, body);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${path3} ${res.statusCode} - ${duration}ms`);
    if (capturedJsonResponse) {
      log("Response:", JSON.stringify(capturedJsonResponse, null, 2));
    }
  });
  next();
});
app.use("/api/support", support_routes_default);
registerRoutes(app);
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : void 0
  });
});
var PORT = process.env.NODE_ENV === "development" ? 3e3 : parseInt(process.env.PORT || "5000", 10);
if (process.env.NODE_ENV !== "development") {
  serveStatic(app);
}
var server = http.createServer(app);
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  server.listen(PORT, "0.0.0.0", () => {
    const env = process.env.NODE_ENV || "development";
    const frontendPort = env === "development" ? "5000" : process.env.PORT || "5000";
    console.log(`
=== PC Guide Pro ===`);
    console.log(`Environment: ${env}`);
    console.log(`Frontend:    http://localhost:${frontendPort}`);
    console.log(`Backend API: http://localhost:${PORT}
`);
  });
}
var index_default = app;
export {
  app,
  index_default as default,
  server
};
