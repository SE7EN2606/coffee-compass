import { pgTable, text, serial, integer, boolean, timestamp, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  coffeeShops: many(coffeeShops),
  ratings: many(ratings),
}));

export const coffeeShops = pgTable("coffee_shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  coffeeBrands: text("coffee_brands"), // Now storing as JSON string of brands array
  machineBrands: text("machine_brands"), // Now storing as JSON string of machine brands array
  coffeeStyles: text("coffee_styles"), // Now storing as JSON string of styles array
  priceRange: text("price_range"), // Stored as JSON string [min, max]
  openNow: boolean("open_now"),
  isIndependent: boolean("is_independent"),
  coffeeQuality: integer("coffee_quality"),
  ambience: integer("ambience"),
  service: integer("service"),
  workability: integer("workability"),
  menuVariety: integer("menu_variety"),
  priceValue: integer("price_value"),
  dietaryOptions: text("dietary_options"), // JSON string array
  noiseLevel: text("noise_level"), // Potentially now an array stored as JSON
  seatingOptions: text("seating_options"), // Potentially now an array stored as JSON
  laptopFriendly: boolean("laptop_friendly"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  userId: integer("user_id").notNull(),
  website: text("website"),
  phone: text("phone"),
  googleUrl: text("google_url"), // URL to the Google Maps page
  openingHours: text("opening_hours"), // JSON string of opening hours
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coffeeShopsRelations = relations(coffeeShops, ({ one, many }) => ({
  user: one(users, {
    fields: [coffeeShops.userId],
    references: [users.id],
  }),
  ratings: many(ratings),
}));

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  review: text("review"),
  visited: boolean("visited").default(false),
  wantToGo: boolean("want_to_go").default(false),
  userId: integer("user_id").notNull(),
  shopId: integer("shop_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  shop: one(coffeeShops, {
    fields: [ratings.shopId],
    references: [coffeeShops.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true,
});

export const insertCoffeeShopSchema = createInsertSchema(coffeeShops)
  .pick({
    name: true,
    address: true,
    description: true,
    imageUrl: true,
    coffeeBrands: true,
    machineBrands: true,
    coffeeStyles: true,
    priceRange: true,
    openNow: true,
    isIndependent: true,
    coffeeQuality: true,
    ambience: true,
    service: true,
    workability: true,
    menuVariety: true,
    priceValue: true,
    dietaryOptions: true,
    noiseLevel: true,
    seatingOptions: true,
    laptopFriendly: true,
    latitude: true,
    longitude: true,
    website: true,
    phone: true,
    googleUrl: true,
    openingHours: true,
  })
  .extend({
    name: z.string().min(3).max(100),
    address: z.string().min(5).max(200),
    description: z.string().min(10).max(1000),
    imageUrl: z.string().url(),
    // Array fields stored as JSON strings
    coffeeBrands: z.string().optional().transform(val => val ? JSON.parse(val) : []),
    machineBrands: z.string().optional().transform(val => val ? JSON.parse(val) : []),
    coffeeStyles: z.string().optional().transform(val => val ? JSON.parse(val) : []),
    priceRange: z.string().optional().transform(val => val ? JSON.parse(val) : [1, 5]),
    openNow: z.boolean().optional(),
    isIndependent: z.boolean().optional(),
    // Rating fields
    coffeeQuality: z.number().min(1).max(5).optional(),
    ambience: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    workability: z.number().min(1).max(5).optional(),
    menuVariety: z.number().min(1).max(5).optional(),
    priceValue: z.number().min(1).max(5).optional(),
    // Additional info fields
    dietaryOptions: z.string().optional().transform(val => val ? JSON.parse(val) : []),
    noiseLevel: z.string().optional(),
    seatingOptions: z.string().optional().transform(val => val ? JSON.parse(val) : []),
    laptopFriendly: z.boolean().optional(),
    // Location fields
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    // Contact and hours
    website: z.string().url().optional(),
    phone: z.string().optional(),
    googleUrl: z.string().url().optional(),
    openingHours: z.string().optional().transform(val => val ? JSON.parse(val) : {}),
  });

export const insertRatingSchema = createInsertSchema(ratings)
  .pick({
    rating: true,
    review: true,
    visited: true,
    wantToGo: true,
    shopId: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
    review: z.string().min(3).max(500).optional(),
    visited: z.boolean().default(false),
    wantToGo: z.boolean().default(false),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCoffeeShop = z.infer<typeof insertCoffeeShopSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type User = typeof users.$inferSelect;
export type CoffeeShop = typeof coffeeShops.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type SelectUser = typeof users.$inferSelect;
