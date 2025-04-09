import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Parse the database connection string from environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

// Create a PostgreSQL client
const client = postgres(DATABASE_URL, {
  max: 10, // Maximum connections in the pool
  ssl: true, // Enable SSL for all environments since Replit requires it
});

// Create a Drizzle ORM instance
export const db = drizzle(client, { schema });

// Export for direct usage
export default db;