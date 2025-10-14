import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

dotenv.config();

// Only initialize database connection if POSTGRES_URL is available and valid
// This prevents build errors and connection errors when database is not set up
let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

if (process.env.POSTGRES_URL && process.env.POSTGRES_URL.trim() !== '') {
  try {
    client = postgres(process.env.POSTGRES_URL, {
      max: 1, // Limit connections
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzle(client, { schema });
  } catch (error) {
    console.warn('Database connection failed, running without database:', error);
    client = null;
    db = null;
  }
}

export { client, db };
