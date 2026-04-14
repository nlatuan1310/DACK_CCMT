import "dotenv/config";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// ── Connection pool ──────────────────────────────────────────
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// ── Prisma adapter cho PostgreSQL ────────────────────────────
const adapter = new PrismaPg(pool);

// ── Singleton pattern — tránh tạo nhiều connection khi dev ──
const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
