import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

// If DATABASE_URL is set as "file:./local.db", we only want the path "./local.db"
const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace('file:', '')
    : './local.db';

export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
