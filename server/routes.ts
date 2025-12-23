import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPartSchema, insertSavedBuildSchema, insertGuideSchema, checkoutSchema, pcRequestSchema, ISavedBuild, IOrderItem } from "@shared/schema";
import { generateRecommendation, compareParts } from "./ai/recommendation-engine";
import { WebSocketServer } from "ws";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { sendBillingEmail, sendPCRequestEmail, generateOrderNumber } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

req.session!.userId = user._id.toString();
      res.json({ id: user._id.toString(), username: user.username });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

req.session!.userId = user._id.toString();
      res.json({ id: user._id.toString(), username: user.username });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: user._id.toString(), username: user.username, email: user.email });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Parts routes
  app.get("/api/parts", async (req, res) => {
    try {
      const { type, brand, minPrice, maxPrice, query } = req.query;
      const parts = await storage.searchParts({
        type: type as string,
        brand: brand as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        query: query as string,
      });
      res.json(parts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced Parts Browser API - MUST be defined before /api/parts/:id
  app.get("/api/parts/browse", async (req, res) => {
    try {
      const filters = {
        type: req.query.type as string | undefined,
        brand: req.query.brand as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        query: req.query.query as string | undefined,
        inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
        sortBy: req.query.sortBy as 'price' | 'name' | 'rating' | 'brand' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };
      
      const result = await storage.searchPartsAdvanced(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parts/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parts/types", async (req, res) => {
    try {
      const types = await storage.getAllPartTypes();
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/parts/batch", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }
      const parts = await storage.getPartsByIds(ids);
      res.json(parts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parts/:id", async (req, res) => {
    try {
      const part = await storage.getPart(req.params.id);
      if (!part) {
        return res.status(404).json({ error: "Part not found" });
      }
      res.json(part);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/parts", async (req, res) => {
    try {
      const data = insertPartSchema.parse(req.body);
      const part = await storage.createPart(data);
      res.status(201).json(part);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/parts/:id/price-history", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const history = await storage.getPriceHistory(req.params.id, days);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Recommendation routes
  app.post("/api/recommend", async (req, res) => {
    try {
      const { budget, useCase, performance, brands } = req.body;
      
      if (!budget || !useCase || !performance) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const recommendation = await generateRecommendation({
        budget: parseFloat(budget),
        useCase,
        performance,
        brands,
      });

      res.json(recommendation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/compare", async (req, res) => {
    try {
      const { partIds } = req.body;
      
      if (!Array.isArray(partIds) || partIds.length < 2) {
        return res.status(400).json({ error: "Need at least 2 part IDs to compare" });
      }

      const result = await compareParts(partIds);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Saved builds routes
  app.get("/api/builds", requireAuth, async (req, res) => {
    try {
      const builds = await storage.getUserBuilds(req.session!.userId!);
      res.json(builds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/builds/public", async (req, res) => {
    try {
      const builds = await storage.getPublicBuilds();
      res.json(builds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/builds/:id", async (req, res) => {
    try {
      const build = await storage.getSavedBuild(req.params.id);
      if (!build) {
        return res.status(404).json({ error: "Build not found" });
      }
      res.json(build);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/builds", requireAuth, async (req, res) => {
    try {
      const buildData = insertSavedBuildSchema.parse({
        ...req.body,
        user: req.session!.userId,
      });
      
      // Convert the build data to match ISavedBuild structure
      const buildToCreate: Partial<ISavedBuild> = {
        ...buildData,
        user: new Types.ObjectId(buildData.user),
        partsConfig: buildData.partsConfig.map(pc => ({
          ...pc,
          part: new Types.ObjectId(pc.part)
        }))
      };
      
      const build = await storage.createSavedBuild(buildToCreate);
      res.status(201).json(build);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/builds/:id", requireAuth, async (req, res) => {
    try {
      const build = await storage.getSavedBuild(req.params.id);
      if (!build || build.user.toString() !== req.session!.userId) {
        return res.status(404).json({ error: "Build not found" });
      }

      const updated = await storage.updateSavedBuild(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/builds/:id", requireAuth, async (req, res) => {
    try {
      const build = await storage.getSavedBuild(req.params.id);
      if (!build || build.user.toString() !== req.session!.userId) {
        return res.status(404).json({ error: "Build not found" });
      }

      await storage.deleteSavedBuild(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Guides routes
  app.get("/api/guides", async (req, res) => {
    try {
      const { query } = req.query;
      const guides = query
        ? await storage.searchGuides(query as string)
        : await storage.getAllGuides();
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ error: "Guide not found" });
      }
      res.json(guide);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/guides", async (req, res) => {
    try {
      const data = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(data);
      res.status(201).json(guide);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/guides/:id", async (req, res) => {
    try {
      const updated = await storage.updateGuide(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Guide not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/guides/:id", async (req, res) => {
    try {
      await storage.deleteGuide(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bookmarks routes
  app.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.session!.userId!);
      res.json(bookmarks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const { guideId } = req.body;
      const bookmark = await storage.createBookmark(req.session!.userId!, guideId);
      res.status(201).json(bookmark);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/bookmarks/:guideId", requireAuth, async (req, res) => {
    try {
      await storage.deleteBookmark(req.session!.userId!, req.params.guideId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cart API routes
  app.get("/api/cart", async (req, res) => {
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
      const partsMap = new Map(parts.map(p => [p._id.toString(), p]));
      
      const items = cartData.items.map(item => {
        const part = partsMap.get(item.part.toString());
        return {
          partId: item.part.toString(),
          quantity: item.quantity,
          part: part || null
        };
      }).filter(item => item.part !== null);

      const total = items.reduce((sum, item) => 
        sum + (item.part?.price || 0) * item.quantity, 0
      );

      res.json({
        id: cartData._id,
        items,
        total,
        currency: cartData.currency,
        region: cartData.region,
        itemCount: items.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart/add", async (req, res) => {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/cart/update", async (req, res) => {
    try {
      const { partId, quantity } = req.body;
      if (!partId || quantity === undefined) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/remove/:partId", async (req, res) => {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/clear", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      
      const cart = await storage.getCart(userId, sessionId);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      
      await storage.clearCart(cart._id.toString());
      res.json({ success: true, message: "Cart cleared" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Checkout API - Complete order and send billing email
  app.post("/api/checkout/complete", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      
      // Validate checkout data
      const checkoutData = checkoutSchema.parse(req.body);
      
      // Get the cart
      const cart = await storage.getCart(userId, sessionId);
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Get cart with parts details
      const cartWithParts = await storage.getCartWithParts(cart._id.toString());
      if (!cartWithParts) {
        return res.status(400).json({ error: "Failed to retrieve cart items" });
      }
      
      const { parts } = cartWithParts;
      const partsMap = new Map(parts.map(p => [p._id.toString(), p]));
      
      // Build order items with part details
      const orderItems: IOrderItem[] = cart.items.map(item => {
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
      
      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.0825; // 8.25% tax
      const total = subtotal + tax;
      
      // Generate order number
      const orderNumber = generateOrderNumber();
      
      // Create the order
      const order = await storage.createOrder({
        orderNumber,
        user: userId ? new Types.ObjectId(userId) : undefined,
        sessionId,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        items: orderItems,
        subtotal,
        tax,
        total,
        currency: cart.currency || 'USD',
        status: 'completed',
        billingEmailSent: false,
        createdAt: new Date()
      });
      
      // Send billing email
      const emailResult = await sendBillingEmail({
        orderNumber,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        items: orderItems.map(item => ({
          partName: item.partName,
          partType: item.partType,
          partBrand: item.partBrand,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        tax,
        total,
        currency: cart.currency || 'USD',
        createdAt: new Date()
      });
      
      // Update order with email status
      await storage.updateOrder(order._id.toString(), {
        billingEmailSent: emailResult.success,
        billingEmailSentAt: emailResult.success ? new Date() : undefined,
        billingEmailError: emailResult.error
      });
      
      // Clear the cart after successful order
      await storage.clearCart(cart._id.toString());
      
      // Return response with email status
      res.json({
        success: true,
        orderNumber,
        total,
        subtotal,
        tax,
        currency: cart.currency || 'USD',
        itemCount: orderItems.length,
        emailSent: emailResult.success,
        emailError: emailResult.success ? undefined : emailResult.error,
        message: emailResult.success 
          ? `Receipt emailed to ctechmtv@gmail.com`
          : 'Order completed but email could not be sent. Please contact support.'
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // PC Request API - Send build request to expert builder
  app.post("/api/pc-request", async (req, res) => {
    try {
      const requestData = pcRequestSchema.parse(req.body);
      
      const emailResult = await sendPCRequestEmail({
        customerName: requestData.customerName,
        customerEmail: requestData.customerEmail,
        customerPhone: requestData.customerPhone,
        customerCity: requestData.customerCity,
        customerBudget: requestData.customerBudget,
        customerNotes: requestData.customerNotes,
        items: requestData.items.map(item => ({
          partName: item.partName,
          partType: item.partType,
          partBrand: item.partBrand,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: requestData.subtotal,
        tax: requestData.tax,
        total: requestData.total,
        currency: requestData.currency,
      });

      // Clear the cart after successful request
      const userId = req.session?.userId;
      const sessionId = req.sessionID;
      const cart = await storage.getCart(userId, sessionId);
      if (cart) {
        await storage.clearCart(cart._id.toString());
      }

      res.json({
        success: true,
        message: 'Your PC request has been sent to an expert builder. We will contact you through your email soon.',
        emailSent: emailResult.success,
        emailError: emailResult.success ? undefined : emailResult.error,
      });
    } catch (error: any) {
      console.error('PC request error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get order by order number
  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's orders (requires auth)
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.session!.userId!);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Compatibility check API
  app.post("/api/compatibility/check", async (req, res) => {
    try {
      const { partIds } = req.body;
      if (!Array.isArray(partIds) || partIds.length === 0) {
        return res.status(400).json({ error: "partIds must be a non-empty array" });
      }

      const parts = await storage.getPartsByIds(partIds);
      const issues: string[] = [];
      let compatible = true;

      // Find CPU and motherboard
      const cpu = parts.find(p => p.type === 'cpu');
      const motherboard = parts.find(p => p.type === 'motherboard');
      const ram = parts.find(p => p.type === 'ram');
      const gpu = parts.find(p => p.type === 'gpu');
      const psu = parts.find(p => p.type === 'psu');
      const cooler = parts.find(p => p.type === 'cooling');

      // Check CPU-Motherboard socket compatibility
      if (cpu && motherboard) {
        const cpuSocket = cpu.specs?.socket;
        const moboSocket = motherboard.specs?.socket;
        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
          issues.push(`CPU socket (${cpuSocket}) is not compatible with motherboard socket (${moboSocket})`);
          compatible = false;
        }
      }

      // Check RAM-Motherboard memory type compatibility
      if (ram && motherboard) {
        const ramType = ram.specs?.type;
        const moboMemoryType = motherboard.specs?.memoryType;
        if (ramType && moboMemoryType && ramType !== moboMemoryType) {
          issues.push(`RAM type (${ramType}) is not compatible with motherboard memory type (${moboMemoryType})`);
          compatible = false;
        }
      }

      // Check CPU-Cooler socket compatibility
      if (cpu && cooler) {
        const cpuSocket = cpu.specs?.socket;
        const coolerCompatibility = cooler.compatibility || [];
        if (cpuSocket && coolerCompatibility.length > 0 && !coolerCompatibility.includes(cpuSocket)) {
          issues.push(`CPU cooler may not be compatible with ${cpuSocket} socket`);
          compatible = false;
        }
      }

      // Check PSU wattage (estimate total power)
      if (psu) {
        let estimatedPower = 100; // Base system power
        if (cpu) estimatedPower += 125; // Average CPU TDP
        if (gpu && gpu.specs?.tdp) {
          estimatedPower += typeof gpu.specs.tdp === 'number' ? gpu.specs.tdp : parseInt(gpu.specs.tdp);
        }
        
        const psuWattage = typeof psu.specs?.wattage === 'number' 
          ? psu.specs.wattage 
          : parseInt(psu.specs?.wattage?.replace('W', '') || '0');
        
        if (psuWattage > 0 && estimatedPower > psuWattage * 0.8) {
          issues.push(`PSU (${psuWattage}W) may be insufficient for estimated power draw (~${estimatedPower}W). Consider 20% headroom.`);
        }
      }

      res.json({
        compatible,
        issues,
        checkedParts: parts.map(p => ({ id: p._id, name: p.name, type: p.type }))
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // WebSocket server for real-time price updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "subscribe" && data.partIds) {
          // Client subscribes to price updates for specific parts
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

  // Function to broadcast price updates (can be called from a background job)
  app.locals.broadcastPriceUpdate = (partId: number, newPrice: number) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({
          type: "price_update",
          partId,
          price: newPrice,
          timestamp: new Date().toISOString(),
        }));
      }
    });
  };

  return httpServer;
}
