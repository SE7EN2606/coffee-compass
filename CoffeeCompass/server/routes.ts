import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCoffeeShopSchema, insertRatingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { registerPlacesRoutes } from "./places";

// Default guest user ID for non-authenticated requests
const GUEST_USER_ID = 1;

export function registerRoutes(app: Express): Server {
  // Register Google Places API routes
  registerPlacesRoutes(app);
  
  // Coffee shop routes
  app.get("/api/coffee-shops", async (_req, res) => {
    const shops = await storage.listCoffeeShops();
    res.json(shops);
  });

  app.get("/api/coffee-shops/:id", async (req, res) => {
    const shop = await storage.getCoffeeShop(Number(req.params.id));
    if (!shop) return res.status(404).send("Coffee shop not found");
    res.json(shop);
  });

  app.post("/api/coffee-shops", async (req, res) => {
    try {
      const validatedData = insertCoffeeShopSchema.parse(req.body);
      const shop = await storage.createCoffeeShop({
        ...validatedData,
        userId: GUEST_USER_ID,
      });
      res.status(201).json(shop);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(err.errors);
      } else {
        throw err;
      }
    }
  });

  // Rating routes
  app.get("/api/coffee-shops/:id/ratings", async (req, res) => {
    const ratings = await storage.getRatingsForShop(Number(req.params.id));
    res.json(ratings);
  });

  app.post("/api/coffee-shops/:id/ratings", async (req, res) => {
    try {
      // Parse validation data but don't include shopId that will be overridden
      const { shopId, ...otherData } = req.body;
      const validatedData = insertRatingSchema.parse(otherData);
      
      const rating = await storage.createRating({
        ...validatedData,
        shopId: Number(req.params.id),
        userId: GUEST_USER_ID,
      } as any);
      res.status(201).json(rating);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(err.errors);
      } else {
        throw err;
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
