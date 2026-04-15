/**
 * Script test cho Task: Tự động hóa gán quyền & Ràng buộc API Issue
 * Test: POST /api/projects (auto ADMIN), POST /api/issues (ADMIN only),
 *       PATCH /api/issues/:id/status (ADMIN + USER)
 *
 * Chạy: node src/test-rbac-issue.js
 */

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
  console.log("=== TEST: Tự động gán quyền & Ràng buộc API Issue ===\n");
  let passed = 0, failed = 0;

  // ── 0. Login 2 users ──────────────────────────────────────
  console.log("0) Đăng nhập admin & user...");

  const loginAdmin = await request("POST", "/auth/login", {
    email: "admin_member_test@test.com",
    password: "123456",
  });
  const adminToken = loginAdmin.data.data?.token;
  const adminId = loginAdmin.data.data?.user?.id;
  console.log("   Admin:", adminToken ? "✅ OK" : "❌ FAIL");

  const loginUser = await request("POST", "/auth/login", {
    email: "user_member_test@test.com",
    password: "123456",
  });
  const userToken = loginUser.data.data?.token;
  const userId = loginUser.data.data?.user?.id;
  console.log("   User:", userToken ? "✅ OK" : "❌ FAIL");

  if (!adminToken || !userToken) {
    console.log("❌ Không thể đăng nhập. Dừng test.");
    return;
  }

  // ══════════════════════════════════════════════════════════
  // PHẦN 1: POST /api/projects — Auto-assign ADMIN
  // ══════════════════════════════════════════════════════════
  console.log("\n── PHẦN 1: POST /api/projects (auto ADMIN) ──\n");

  // Test 1: Tạo project không token → 401
  console.log("1) POST /projects không token → expect 401");
  const t1 = await request("POST", "/projects", { name: "No Auth", key: "NA" });
  check("Status", t1.status, 401) ? passed++ : failed++;

  // Test 2: Tạo project có token → 201 + creator là ADMIN
  console.log("\n2) POST /projects có token → expect 201 + ADMIN membership");
  const t2 = await request("POST", "/projects", {
    name: "RBAC Test Project",
    key: "RBAC_TST",
    description: "Dự án test RBAC cho issue",
  }, adminToken);
  check("Status", t2.status, 201) ? passed++ : failed++;

  const projectId = t2.data.data?.id;
  const members = t2.data.data?.members || [];
  const creatorMember = members.find(m => m.userId === adminId);
  check("Creator là ADMIN", creatorMember?.role, "ADMIN") ? passed++ : failed++;
  console.log("   Project ID:", projectId);

  // Test 3: Tạo project key trùng → 409
  console.log("\n3) POST /projects key trùng → expect 409");
  const t3 = await request("POST", "/projects", {
    name: "Duplicate",
    key: "RBAC_TST",
  }, adminToken);
  check("Status", t3.status, 409) ? passed++ : failed++;

  // Test 4: Thiếu name → 400
  console.log("\n4) POST /projects thiếu name → expect 400");
  const t4 = await request("POST", "/projects", { key: "X" }, adminToken);
  check("Status", t4.status, 400) ? passed++ : failed++;

  if (!projectId) {
    console.log("❌ Không tạo được project. Dừng test.");
    return;
  }

  // Mời user thường vào project với role USER
  console.log("\n   Mời user vào project với role USER...");
  await request("POST", `/projects/${projectId}/members`, {
    email: "user_member_test@test.com",
  }, adminToken);
  console.log("   ✅ Đã mời user");

  // ══════════════════════════════════════════════════════════
  // PHẦN 2: POST /api/issues — Chỉ ADMIN tạo được
  // ══════════════════════════════════════════════════════════
  console.log("\n── PHẦN 2: POST /api/issues (ADMIN only) ──\n");

  // Test 5: ADMIN tạo issue → 201
  console.log("5) ADMIN tạo issue → expect 201");
  const t5 = await request("POST", "/issues", {
    title: "Issue test RBAC",
    projectId,
    type: "TASK",
  }, adminToken);
  check("Status", t5.status, 201) ? passed++ : failed++;
  const issueId = t5.data.data?.id;
  console.log("   Issue ID:", issueId);

  // Test 6: USER tạo issue → 403
  console.log("\n6) USER tạo issue → expect 403 (RBAC block)");
  const t6 = await request("POST", "/issues", {
    title: "User tries to create",
    projectId,
  }, userToken);
  check("Status", t6.status, 403) ? passed++ : failed++;

  // Test 7: Không token tạo issue → 401
  console.log("\n7) Không token tạo issue → expect 401");
  const t7 = await request("POST", "/issues", {
    title: "No auth",
    projectId,
  });
  check("Status", t7.status, 401) ? passed++ : failed++;

  // ══════════════════════════════════════════════════════════
  // PHẦN 3: PATCH /api/issues/:id/status — Cả ADMIN + USER
  // ══════════════════════════════════════════════════════════
  console.log("\n── PHẦN 3: PATCH /api/issues/:id/status (ADMIN + USER) ──\n");

  if (!issueId) {
    console.log("❌ Không có issue để test. Dừng.");
    return;
  }

  // Test 8: ADMIN chuyển status → 200
  console.log("8) ADMIN chuyển status TODO → IN_PROGRESS → expect 200");
  const t8 = await request("PATCH", `/issues/${issueId}/status`, {
    status: "IN_PROGRESS",
  }, adminToken);
  check("Status", t8.status, 200) ? passed++ : failed++;
  console.log("   New status:", t8.data.data?.status);

  // Test 9: USER chuyển status → 200 (cho phép kéo thả)
  console.log("\n9) USER chuyển status IN_PROGRESS → TEST → expect 200");
  const t9 = await request("PATCH", `/issues/${issueId}/status`, {
    status: "TEST",
  }, userToken);
  check("Status", t9.status, 200) ? passed++ : failed++;
  console.log("   New status:", t9.data.data?.status);

  // Test 10: Không token chuyển status → 401
  console.log("\n10) Không token chuyển status → expect 401");
  const t10 = await request("PATCH", `/issues/${issueId}/status`, {
    status: "DONE",
  });
  check("Status", t10.status, 401) ? passed++ : failed++;

  // ── Kết quả ───────────────────────────────────────────────
  console.log(`\n=== KẾT QUẢ: ${passed}/${passed + failed} passed ===`);
  if (failed > 0) console.log(`⚠️  ${failed} test(s) FAILED`);
  else console.log("🎉 All tests passed!");
}

main().catch(console.error);
