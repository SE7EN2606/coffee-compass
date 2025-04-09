// CommonJS version of schema for Netlify functions
const { pgTable, text, serial, integer, boolean, timestamp, real, primaryKey } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// Users table
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Coffee Shops table
const coffeeShops = pgTable("coffee_shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  coffeeBrands: text("coffee_brands"), // JSON string of brands array
  machineBrands: text("machine_brands"), // JSON string of machine brands array
  coffeeStyles: text("coffee_styles"), // JSON string of styles array
  priceRange: text("price_range"), // JSON string [min, max]
  openNow: boolean("open_now"),
  isIndependent: boolean("is_independent"),
  coffeeQuality: integer("coffee_quality"),
  ambience: integer("ambience"),
  service: integer("service"),
  workability: integer("workability"),
  menuVariety: integer("menu_variety"),
  priceValue: integer("price_value"),
  dietaryOptions: text("dietary_options"), // JSON string array
  noiseLevel: text("noise_level"), // Potentially an array stored as JSON
  seatingOptions: text("seating_options"), // Potentially an array stored as JSON
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

// Ratings table
const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  review: text("review"),
  visited: boolean("visited").default(false),
  wantToGo: boolean("want_to_go").default(false),
  userId: integer("user_id").notNull(),
  shopId: integer("shop_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations for reference (not used in serverless functions but good for documentation)
const usersRelations = relations(users, ({ many }) => ({
  coffeeShops: many(coffeeShops),
  ratings: many(ratings),
}));

const coffeeShopsRelations = relations(coffeeShops, ({ one, many }) => ({
  user: one(users, {
    fields: [coffeeShops.userId],
    references: [users.id],
  }),
  ratings: many(ratings),
}));

const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  shop: one(coffeeShops, {
    fields: [ratings.shopId],
    references: [coffeeShops.id],
  }),
}));

// Export the schema
module.exports = {
  users,
  coffeeShops,
  ratings
};