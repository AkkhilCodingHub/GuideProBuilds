import { Schema, Types } from 'mongoose';
import {
  User,
  Part,
  SavedBuild,
  Guide,
  BookmarkedGuide,
  PriceHistory,
  Cart,
  Order,
  IUser,
  IPart,
  ISavedBuild,
  IGuide,
  IBookmarkedGuide,
  IPriceHistory,
  ICart,
  IOrder,
  IOrderItem,
  InsertUser,
  InsertPart,
  InsertSavedBuild
} from '@shared/schema';
import db from './db';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  
  // Parts operations
  getPart(id: string): Promise<IPart | null>;
  searchParts(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
  }): Promise<IPart[]>;
  createPart(part: Partial<IPart>): Promise<IPart>;
  updatePart(id: string, part: Partial<IPart>): Promise<IPart | null>;
  upsertPartByExternalId(externalId: string, part: Partial<IPart>): Promise<IPart>;
  getPartsByType(type: string): Promise<IPart[]>;
  
  // Saved builds operations
  getSavedBuild(id: string): Promise<ISavedBuild | null>;
  getUserBuilds(userId: string): Promise<ISavedBuild[]>;
  createSavedBuild(build: Partial<ISavedBuild>): Promise<ISavedBuild>;
  updateSavedBuild(id: string, build: Partial<ISavedBuild>): Promise<ISavedBuild | null>;
  deleteSavedBuild(id: string): Promise<boolean>;
  getPublicBuilds(): Promise<ISavedBuild[]>;
  
  // Guides operations
  getGuide(id: string): Promise<IGuide | null>;
  getAllGuides(): Promise<IGuide[]>;
  searchGuides(query: string): Promise<IGuide[]>;
  createGuide(guide: Partial<IGuide>): Promise<IGuide>;
  updateGuide(id: string, guide: Partial<IGuide>): Promise<IGuide | null>;
  deleteGuide(id: string): Promise<boolean>;
  
  // Bookmarks operations
  getUserBookmarks(userId: string): Promise<IBookmarkedGuide[]>;
  createBookmark(userId: string, guideId: string): Promise<IBookmarkedGuide>;
  deleteBookmark(userId: string, guideId: string): Promise<boolean>;
  
  // Price history
  recordPrice(partId: string, price: number): Promise<void>;
  getPriceHistory(partId: string, days: number): Promise<{ price: string; recordedAt: Date }[]>;
  
  // Enhanced parts operations
  searchPartsAdvanced(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
    inStock?: boolean;
    sortBy?: 'price' | 'name' | 'rating' | 'brand';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ parts: IPart[]; total: number; page: number; totalPages: number }>;
  getPartsByIds(ids: string[]): Promise<IPart[]>;
  getAllBrands(): Promise<string[]>;
  getAllPartTypes(): Promise<string[]>;
  
  // Cart operations
  getCart(userId?: string, sessionId?: string): Promise<ICart | null>;
  getOrCreateCart(userId?: string, sessionId?: string): Promise<ICart>;
  addToCart(cartId: string, partId: string, quantity: number): Promise<ICart>;
  updateCartItem(cartId: string, partId: string, quantity: number): Promise<ICart>;
  removeFromCart(cartId: string, partId: string): Promise<ICart>;
  clearCart(cartId: string): Promise<ICart>;
  getCartWithParts(cartId: string): Promise<{ cart: ICart; parts: IPart[] } | null>;
  
  // Order operations
  createOrder(order: Partial<IOrder>): Promise<IOrder>;
  getOrder(id: string): Promise<IOrder | null>;
  getOrderByNumber(orderNumber: string): Promise<IOrder | null>;
  updateOrder(id: string, updates: Partial<IOrder>): Promise<IOrder | null>;
  getUserOrders(userId: string): Promise<IOrder[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return User.findById(id).lean<IUser>().exec();
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username }).lean<IUser>().exec();
  }

  async createUser(user: InsertUser): Promise<IUser> {
    const newUser = await User.create(user);
    return newUser.toObject() as IUser;
  }

  // Parts operations
  async getPart(id: string): Promise<IPart | null> {
    return Part.findById(id).lean<IPart>().exec();
  }

  async searchParts(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
  }): Promise<IPart[]> {
    const query: any = {};
    if (filters.type) query.type = filters.type;
    if (filters.brand) query.brand = filters.brand;
    if (filters.minPrice !== undefined) query.price = { ...query.price, $gte: filters.minPrice };
    if (filters.maxPrice !== undefined) query.price = { ...query.price, $lte: filters.maxPrice };
    if (filters.query) query.name = { $regex: filters.query, $options: 'i' };
    return Part.find(query).lean<IPart[]>().exec();
  }

  async createPart(part: InsertPart): Promise<IPart> {
    const newPart = await Part.create(part);
    return newPart.toObject() as IPart;
  }

  async updatePart(id: string, part: Partial<IPart>): Promise<IPart | null> {
    const updatedPart = await Part.findByIdAndUpdate(id, part, { new: true }).lean<IPart>().exec();
    return updatedPart;
  }

  async upsertPartByExternalId(externalId: string, part: Partial<IPart>): Promise<IPart> {
    const result = await Part.findOneAndUpdate(
      { externalId },
      part,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean<IPart>().exec();
    if (!result) {
      throw new Error('Failed to upsert part');
    }
    return result;
  }

  async getPartsByType(type: string): Promise<IPart[]> {
    return Part.find({ type }).lean<IPart[]>().exec();
  }

  // Saved builds operations
  async getSavedBuild(id: string): Promise<ISavedBuild | null> {
    return SavedBuild.findById(id).lean<ISavedBuild>().exec();
  }

  async getUserBuilds(userId: string): Promise<ISavedBuild[]> {
    return SavedBuild.find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean<ISavedBuild[]>()
      .exec();
  }

async createSavedBuild(build: Partial<ISavedBuild>): Promise<ISavedBuild> {
  // Ensure required fields are present
  if (!build.name || !build.user || !build.category || !build.totalPrice || !build.partsConfig) {
    throw new Error('Missing required fields for saved build');
  }

  // TypeScript type assertion since we've already validated the required fields
  const buildToCreate = {
    ...build,
    user: build.user instanceof Types.ObjectId ? build.user : new Types.ObjectId(build.user as string),
    partsConfig: build.partsConfig.map(pc => ({
      ...pc,
      part: pc.part ? (pc.part instanceof Types.ObjectId ? pc.part : new Types.ObjectId(pc.part as string)) : undefined
    }))
  } as ISavedBuild;
  
  const newBuild = await SavedBuild.create(buildToCreate);
  return newBuild.toObject() as ISavedBuild;
}

  async updateSavedBuild(id: string, build: Partial<ISavedBuild>): Promise<ISavedBuild | null> {
    const updatedBuild = await SavedBuild.findByIdAndUpdate(
      id, 
      build, 
      { new: true }
    ).lean<ISavedBuild>().exec();
    return updatedBuild;
  }

  async deleteSavedBuild(id: string): Promise<boolean> {
    const result = await SavedBuild.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async getPublicBuilds(): Promise<ISavedBuild[]> {
    return SavedBuild.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate<{ user: { username: string } }>('user', 'username')
      .lean<ISavedBuild[]>()
      .exec();
  }

  // Guides operations
  async getGuide(id: string): Promise<IGuide | null> {
    return Guide.findById(id).lean<IGuide>().exec();
  }

  async getAllGuides(): Promise<IGuide[]> {
    return Guide.find().lean<IGuide[]>().exec();
  }

  async searchGuides(query: string): Promise<IGuide[]> {
    return Guide.find({ 
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).lean<IGuide[]>().exec();
  }

  async createGuide(guide: Partial<IGuide>): Promise<IGuide> {
    const newGuide = await Guide.create(guide);
    return newGuide.toObject() as IGuide;
  }

  async updateGuide(id: string, guide: Partial<IGuide>): Promise<IGuide | null> {
    const updatedGuide = await Guide.findByIdAndUpdate(
      id, 
      { ...guide, updatedAt: new Date() },
      { new: true }
    ).lean<IGuide>().exec();
    return updatedGuide;
  }

  async deleteGuide(id: string): Promise<boolean> {
    const result = await Guide.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  // Bookmarks operations
  async getUserBookmarks(userId: string): Promise<IBookmarkedGuide[]> {
    return BookmarkedGuide.find({ user: new Types.ObjectId(userId) })
      .populate<{ guide: IGuide }>('guide')
      .sort({ createdAt: -1 })
      .lean<IBookmarkedGuide[]>()
      .exec();
  }

  async createBookmark(userId: string, guideId: string): Promise<IBookmarkedGuide> {
    const bookmark = new BookmarkedGuide({
      user: new Types.ObjectId(userId),
      guide: new Types.ObjectId(guideId)
    });
    const savedBookmark = await bookmark.save();
    return savedBookmark.toObject() as IBookmarkedGuide;
  }

  async deleteBookmark(userId: string, guideId: string): Promise<boolean> {
    const result = await BookmarkedGuide.deleteOne({ 
      user: new Types.ObjectId(userId), 
      guide: new Types.ObjectId(guideId) 
    }).exec();
    return result.deletedCount > 0;
  }

  // Price history
  async recordPrice(partId: string, price: number): Promise<void> {
    await PriceHistory.create({
      part: new Types.ObjectId(partId),
      price,
      recordedAt: new Date()
    });
  }

  async getPriceHistory(partId: string, days: number): Promise<{ price: string; recordedAt: Date }[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const history = await PriceHistory.find({
      part: new Types.ObjectId(partId),
      recordedAt: { $gte: date }
    })
    .sort({ recordedAt: 1 })
    .lean<Array<{ price: number; recordedAt: Date }>>()
    .exec();

    return history.map((item: { price: number; recordedAt: Date }) => ({
      price: item.price.toString(),
      recordedAt: item.recordedAt
    }));
  }

  async searchPartsAdvanced(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
    inStock?: boolean;
    sortBy?: 'price' | 'name' | 'rating' | 'brand';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ parts: IPart[]; total: number; page: number; totalPages: number }> {
    const mongoQuery: any = {};
    
    if (filters.type) mongoQuery.type = filters.type;
    if (filters.brand) mongoQuery.brand = filters.brand;
    if (filters.minPrice !== undefined) mongoQuery.price = { ...mongoQuery.price, $gte: filters.minPrice };
    if (filters.maxPrice !== undefined) mongoQuery.price = { ...mongoQuery.price, $lte: filters.maxPrice };
    if (filters.query) {
      mongoQuery.$or = [
        { name: { $regex: filters.query, $options: 'i' } },
        { brand: { $regex: filters.query, $options: 'i' } },
        { description: { $regex: filters.query, $options: 'i' } }
      ];
    }
    if (filters.inStock !== undefined) mongoQuery.inStock = filters.inStock;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const sortField = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;

    const [parts, total] = await Promise.all([
      Part.find(mongoQuery)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean<IPart[]>()
        .exec(),
      Part.countDocuments(mongoQuery).exec()
    ]);

    return {
      parts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPartsByIds(ids: string[]): Promise<IPart[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return Part.find({ _id: { $in: objectIds } }).lean<IPart[]>().exec();
  }

  async getAllBrands(): Promise<string[]> {
    return Part.distinct('brand').exec();
  }

  async getAllPartTypes(): Promise<string[]> {
    return Part.distinct('type').exec();
  }

  async getCart(userId?: string, sessionId?: string): Promise<ICart | null> {
    const query: any = {};
    if (userId) query.user = new Types.ObjectId(userId);
    else if (sessionId) query.sessionId = sessionId;
    else return null;
    
    return Cart.findOne(query).lean<ICart>().exec();
  }

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<ICart> {
    const existingCart = await this.getCart(userId, sessionId);
    if (existingCart) return existingCart;

    const newCart = await Cart.create({
      user: userId ? new Types.ObjectId(userId) : undefined,
      sessionId: sessionId || undefined,
      items: [],
      currency: 'USD',
      region: 'US'
    });
    return newCart.toObject() as ICart;
  }

  async addToCart(cartId: string, partId: string, quantity: number): Promise<ICart> {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    const existingItem = cart.items.find(
      item => item.part.toString() === partId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        part: new Types.ObjectId(partId),
        quantity,
        addedAt: new Date()
      });
    }

    cart.updatedAt = new Date();
    await cart.save();
    return cart.toObject() as ICart;
  }

  async updateCartItem(cartId: string, partId: string, quantity: number): Promise<ICart> {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.part.toString() !== partId);
    } else {
      const item = cart.items.find(item => item.part.toString() === partId);
      if (item) {
        item.quantity = quantity;
      }
    }

    cart.updatedAt = new Date();
    await cart.save();
    return cart.toObject() as ICart;
  }

  async removeFromCart(cartId: string, partId: string): Promise<ICart> {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter(item => item.part.toString() !== partId);
    cart.updatedAt = new Date();
    await cart.save();
    return cart.toObject() as ICart;
  }

  async clearCart(cartId: string): Promise<ICart> {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    return cart.toObject() as ICart;
  }

  async getCartWithParts(cartId: string): Promise<{ cart: ICart; parts: IPart[] } | null> {
    const cart = await Cart.findById(cartId).lean<ICart>().exec();
    if (!cart) return null;

    const partIds = cart.items.map(item => item.part.toString());
    const parts = await this.getPartsByIds(partIds);

    return { cart, parts };
  }

  // Order operations
  async createOrder(order: Partial<IOrder>): Promise<IOrder> {
    const newOrder = await Order.create(order);
    return newOrder.toObject() as IOrder;
  }

  async getOrder(id: string): Promise<IOrder | null> {
    return Order.findById(id).lean<IOrder>().exec();
  }

  async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    return Order.findOne({ orderNumber }).lean<IOrder>().exec();
  }

  async updateOrder(id: string, updates: Partial<IOrder>): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(id, updates, { new: true }).lean<IOrder>().exec();
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    return Order.find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean<IOrder[]>()
      .exec();
  }
}

export const storage = new DatabaseStorage();
