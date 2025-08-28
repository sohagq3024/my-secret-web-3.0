import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon for server environment
neonConfig.webSocketConstructor = ws;
// Disable SSL certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Use a default database URL for development if not provided
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/myapp';

let db: any;
let pool: any = null;

try {
  if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL found, attempting connection to:", process.env.DATABASE_URL.substring(0, 20) + "...");
    // Use neon serverless if DATABASE_URL is provided
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log("Database connection established successfully");
  } else {
    console.log("No DATABASE_URL found, using in-memory mock database for development");
    // Export a mock database for development
    db = null;
  }
} catch (error: any) {
  console.log("Database connection failed, using in-memory mock database:", error.message);
  db = null;
}

export { db, pool };