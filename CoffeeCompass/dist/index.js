var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  coffeeShops: () => coffeeShops,
  coffeeShopsRelations: () => coffeeShopsRelations,
  insertCoffeeShopSchema: () => insertCoffeeShopSchema,
  insertRatingSchema: () => insertRatingSchema,
  insertUserSchema: () => insertUserSchema,
  ratings: () => ratings,
  ratingsRelations: () => ratingsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  coffeeShops: many(coffeeShops),
  ratings: many(ratings)
}));
var coffeeShops = pgTable("coffee_shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  coffeeBrand: text("coffee_brand"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var coffeeShopsRelations = relations(coffeeShops, ({ one, many }) => ({
  user: one(users, {
    fields: [coffeeShops.userId],
    references: [users.id]
  }),
  ratings: many(ratings)
}));
var ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  review: text("review"),
  visited: boolean("visited").default(false),
  wantToGo: boolean("want_to_go").default(false),
  userId: integer("user_id").notNull(),
  shopId: integer("shop_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id]
  }),
  shop: one(coffeeShops, {
    fields: [ratings.shopId],
    references: [coffeeShops.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true
});
var insertCoffeeShopSchema = createInsertSchema(coffeeShops).pick({
  name: true,
  address: true,
  description: true,
  imageUrl: true,
  coffeeBrand: true,
  latitude: true,
  longitude: true
}).extend({
  name: z.string().min(3).max(100),
  address: z.string().min(5).max(200),
  description: z.string().min(10).max(1e3),
  imageUrl: z.string().url(),
  coffeeBrand: z.string().min(2).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});
var insertRatingSchema = createInsertSchema(ratings).pick({
  rating: true,
  review: true,
  visited: true,
  wantToGo: true,
  shopId: true
}).extend({
  rating: z.number().min(1).max(5),
  review: z.string().min(3).max(500).optional(),
  visited: z.boolean().default(false),
  wantToGo: z.boolean().default(false)
});

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
var client = postgres(DATABASE_URL, {
  max: 10,
  // Maximum connections in the pool
  ssl: process.env.NODE_ENV === "production"
  // Use SSL in production
});
var db = drizzle(client, { schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";
var DatabaseStorage = class {
  sessionStore;
  constructor(sessionStore2) {
    this.sessionStore = sessionStore2;
  }
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Coffee shop operations
  async createCoffeeShop(shop) {
    const [newShop] = await db.insert(coffeeShops).values(shop).returning();
    return newShop;
  }
  async listCoffeeShops() {
    return db.select().from(coffeeShops);
  }
  async getCoffeeShop(id) {
    const [shop] = await db.select().from(coffeeShops).where(eq(coffeeShops.id, id));
    return shop || void 0;
  }
  // Rating operations
  async createRating(rating) {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }
  async getRatingsForShop(shopId) {
    return db.select().from(ratings).where(eq(ratings.shopId, shopId));
  }
};
var MemoryStoreSession = MemoryStore(session);
var sessionStore = new MemoryStoreSession({
  checkPeriod: 864e5
  // Prune expired sessions every 24h
});
var storage = new DatabaseStorage(sessionStore);

// server/routes.ts
import { ZodError } from "zod";
var GUEST_USER_ID = 1;
function registerRoutes(app2) {
  app2.get("/api/coffee-shops", async (_req, res) => {
    const shops = await storage.listCoffeeShops();
    res.json(shops);
  });
  app2.get("/api/coffee-shops/:id", async (req, res) => {
    const shop = await storage.getCoffeeShop(Number(req.params.id));
    if (!shop) return res.status(404).send("Coffee shop not found");
    res.json(shop);
  });
  app2.post("/api/coffee-shops", async (req, res) => {
    try {
      const validatedData = insertCoffeeShopSchema.parse(req.body);
      const shop = await storage.createCoffeeShop({
        ...validatedData,
        userId: GUEST_USER_ID
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
  app2.get("/api/coffee-shops/:id/ratings", async (req, res) => {
    const ratings2 = await storage.getRatingsForShop(Number(req.params.id));
    res.json(ratings2);
  });
  app2.post("/api/coffee-shops/:id/ratings", async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating({
        ...validatedData,
        shopId: Number(req.params.id),
        userId: GUEST_USER_ID
      });
      res.status(201).json(rating);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(err.errors);
      } else {
        throw err;
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
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
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
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

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
