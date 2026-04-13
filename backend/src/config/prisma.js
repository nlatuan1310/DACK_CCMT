import { PrismaClient } from "@prisma/client";

// Singleton pattern — tránh tạo nhiều connection khi dev với hot-reload
const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
