/**
 * Script test nhanh cho 3 API Member Management.
 * Tự tạo project + gán ADMIN bằng Prisma, rồi test qua HTTP.
 * Chạy: node src/test-member-api.js
 */
import "dotenv/config";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE = "http://localhost:5000/api";

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

function check(label, actual, expected) {
  const pass = actual === expected;
  console.log(`   ${pass ? "✅" : "❌"} ${label}: ${actual} ${pass ? "" : `(expected ${expected})`}`);
  return pass;
}

async function main() {
  console.log("=== TEST MEMBER API ===\n");
  let passed = 0, failed = 0;

  // ── Bước 0: Đăng nhập 2 users (đã register ở lần trước) ──
  console.log("0) Đăng nhập admin & user...");

  const loginAdmin = await request("POST", "/auth/login", {
    email: "admin_member_test@test.com",
    password: "123456",
  });
  const adminToken = loginAdmin.data.data?.token;
  const adminId = loginAdmin.data.data?.user?.id;
  console.log("   Admin:", adminToken ? "✅ OK" : "❌ FAIL", `(id: ${adminId})`);

  const loginUser = await request("POST", "/auth/login", {
    email: "user_member_test@test.com",
    password: "123456",
  });
  const userToken = loginUser.data.data?.token;
  const userId = loginUser.data.data?.user?.id;
  console.log("   User:", userToken ? "✅ OK" : "❌ FAIL", `(id: ${userId})`);

  if (!adminToken || !userToken) {
    console.log("\n❌ Không thể đăng nhập. Dừng test.");
    return;
  }

  // ── Bước 1: Tạo project + gán admin membership bằng Prisma ──
  console.log("\n1) Tạo project test bằng Prisma...");

  let project = await prisma.project.findUnique({ where: { key: "TEST_MBR" } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Test Member API",
        key: "TEST_MBR",
        description: "Dự án test cho member API",
      },
    });
  }
  console.log("   Project:", project.name, `(${project.id})`);

  // Gán admin user làm ADMIN của project
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: adminId } },
    update: { role: "ADMIN" },
    create: { projectId: project.id, userId: adminId, role: "ADMIN" },
  });
  console.log("   Admin membership: ✅ ADMIN");

  const projectId = project.id;

  // ── Test 2: GET members không token → 401 ─────────────────
  console.log("\n2) GET members KHÔNG token → expect 401");
  const t2 = await request("GET", `/projects/${projectId}/members`);
  check("Status", t2.status, 401) ? passed++ : failed++;

  // ── Test 3: GET members CÓ token (admin) → 200 ───────────
  console.log("\n3) GET members CÓ token → expect 200");
  const t3 = await request("GET", `/projects/${projectId}/members`, null, adminToken);
  check("Status", t3.status, 200) ? passed++ : failed++;
  console.log("   Members hiện tại:", t3.data.total);

  // ── Test 4: POST invite bằng email → 201 ─────────────────
  // Xóa membership cũ nếu có (để test clean)
  await prisma.projectMember.deleteMany({
    where: { projectId, userId },
  });

  console.log("\n4) POST invite user_member_test@test.com → expect 201");
  const t4 = await request(
    "POST",
    `/projects/${projectId}/members`,
    { email: "user_member_test@test.com" },
    adminToken
  );
  check("Status", t4.status, 201) ? passed++ : failed++;
  console.log("   Added:", t4.data.data?.user?.email, "→", t4.data.data?.role);

  // ── Test 5: POST invite trùng → 409 ──────────────────────
  console.log("\n5) POST invite trùng → expect 409");
  const t5 = await request(
    "POST",
    `/projects/${projectId}/members`,
    { email: "user_member_test@test.com" },
    adminToken
  );
  check("Status", t5.status, 409) ? passed++ : failed++;

  // ── Test 6: POST invite email không tồn tại → 404 ────────
  console.log("\n6) POST invite email NOT FOUND → expect 404");
  const t6 = await request(
    "POST",
    `/projects/${projectId}/members`,
    { email: "nonexistent_99@test.com" },
    adminToken
  );
  check("Status", t6.status, 404) ? passed++ : failed++;

  // ── Test 7: POST invite thiếu email → 400 ────────────────
  console.log("\n7) POST invite thiếu email → expect 400");
  const t7 = await request(
    "POST",
    `/projects/${projectId}/members`,
    {},
    adminToken
  );
  check("Status", t7.status, 400) ? passed++ : failed++;

  // ── Test 8: PATCH change role USER → ADMIN → 200 ─────────
  console.log("\n8) PATCH change role → ADMIN → expect 200");
  const t8 = await request(
    "PATCH",
    `/projects/${projectId}/members/${userId}/role`,
    { role: "ADMIN" },
    adminToken
  );
  check("Status", t8.status, 200) ? passed++ : failed++;
  console.log("   New role:", t8.data.data?.role);

  // ── Test 9: PATCH change role ADMIN → USER → 200 ─────────
  console.log("\n9) PATCH change role → USER → expect 200");
  const t9 = await request(
    "PATCH",
    `/projects/${projectId}/members/${userId}/role`,
    { role: "USER" },
    adminToken
  );
  check("Status", t9.status, 200) ? passed++ : failed++;
  console.log("   New role:", t9.data.data?.role);

  // ── Test 10: USER cố POST invite → 403 ───────────────────
  console.log("\n10) USER cố invite (RBAC) → expect 403");
  const t10 = await request(
    "POST",
    `/projects/${projectId}/members`,
    { email: "someone@test.com" },
    userToken
  );
  check("Status", t10.status, 403) ? passed++ : failed++;

  // ── Test 11: USER cố PATCH role → 403 ────────────────────
  console.log("\n11) USER cố change role (RBAC) → expect 403");
  const t11 = await request(
    "PATCH",
    `/projects/${projectId}/members/${adminId}/role`,
    { role: "USER" },
    userToken
  );
  check("Status", t11.status, 403) ? passed++ : failed++;

  // ── Test 12: USER xem members → 200 (cho phép) ───────────
  console.log("\n12) USER GET members (cho phép) → expect 200");
  const t12 = await request("GET", `/projects/${projectId}/members`, null, userToken);
  check("Status", t12.status, 200) ? passed++ : failed++;
  console.log("   Members total:", t12.data.total);
  if (t12.data.data) {
    t12.data.data.forEach((m) => {
      console.log(`   - ${m.user.name} (${m.user.email}) → ${m.role}`);
    });
  }

  // ── Kết quả ───────────────────────────────────────────────
  console.log(`\n=== KẾT QUẢ: ${passed}/${passed + failed} passed ===`);
  if (failed > 0) console.log(`⚠️  ${failed} test(s) FAILED`);
  else console.log("🎉 All tests passed!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
