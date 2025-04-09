// CommonJS version of db.ts for Netlify functions
const { drizzle } = require('drizzle-orm/postgres-js');
const { Pool } = require('pg');
const schema = require('./schema');

// Parse the database connection string from environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

// Create a PostgreSQL client
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Netlify Functions
});

// Create a Drizzle ORM instance
const db = drizzle(pool, { schema });

// Export for direct usage
module.exports = { db, pool };