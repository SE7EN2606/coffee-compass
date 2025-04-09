import { type User, type CoffeeShop, type Rating } from "@shared/schema";
import type { InsertUser, InsertCoffeeShop, InsertRating } from "@shared/schema";
import type { SessionStore } from "express-session";

export interface IStorage {
  sessionStore: SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Coffee shop operations
  createCoffeeShop(shop: InsertCoffeeShop & { userId: number }): Promise<CoffeeShop>;
  listCoffeeShops(): Promise<CoffeeShop[]>;
  getCoffeeShop(id: number): Promise<CoffeeShop | undefined>;
  
  // Rating operations
  createRating(rating: InsertRating & { userId: number }): Promise<Rating>;
  getRatingsForShop(shopId: number): Promise<Rating[]>;
}
