import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPartSchema, insertSavedBuildSchema, insertGuideSchema, ISavedBuild } from "@shared/schema";
import { generateRecommendation, compareParts } from "./ai/recommendation-engine";
import { WebSocketServer } from "ws";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

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
