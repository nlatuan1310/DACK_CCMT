/**
 * Script seed dữ liệu test cho database.
 * Chạy: node src/seed.js
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // ── Tạo User mẫu ────────────────────────────────────────
  const userA = await prisma.user.upsert({
    where: { email: "anhtuan@example.com" },
    update: {},
    create: {
      email: "anhtuan@example.com",
      name: "Anh Tuấn",
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: "minhchau@example.com" },
    update: {},
    create: {
      email: "minhchau@example.com",
      name: "Minh Châu",
    },
  });

  console.log("✅ Users:", userA.id, userB.id);

  // ── Tạo Project mẫu ─────────────────────────────────────
  let project = await prisma.project.findUnique({ where: { key: "PROJ" } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Đồ Án CCMT",
        key: "PROJ",
        description: "Dự án quản lý công việc theo mô hình Jira",
      },
    });
  }

  console.log("✅ Project:", project.id, project.key);

  // ── In ra để test API ────────────────────────────────────
  console.log("\n📋 Dùng projectId này để test Create Issue API:");
  console.log(`   projectId: "${project.id}"`);
  console.log(`   assigneeId: "${userA.id}"`);
  console.log(`   reporterId: "${userB.id}"`);
}

main()
  .catch((e) => {
    console.error("❌ Seed thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
