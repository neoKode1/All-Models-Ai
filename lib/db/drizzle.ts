import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize database connection if POSTGRES_URL is available
// This prevents build errors when environment variables are not set
export const client = process.env.POSTGRES_URL ? postgres(process.env.POSTGRES_URL) : null;
export const db = client ? drizzle(client, { schema }) : null;
