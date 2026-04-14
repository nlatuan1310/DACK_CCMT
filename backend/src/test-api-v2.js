/**
 * Test API Get List Issues + Get Users + CORS headers.
 * Chạy: node src/test-api-v2.js
 */

const API = "http://localhost:5000/api";

async function test() {
  // ── TEST 1: GET /api/users ────────────────────────────────
  console.log("=== TEST 1: GET /api/users ===");
  const res1 = await fetch(`${API}/users`);
  const data1 = await res1.json();
  console.log("Status:", res1.status);
  console.log("Response:", JSON.stringify(data1, null, 2));

  // ── TEST 2: GET /api/issues (tất cả) ─────────────────────
  console.log("\n=== TEST 2: GET /api/issues (tất cả) ===");
  const res2 = await fetch(`${API}/issues`);
  const data2 = await res2.json();
  console.log("Status:", res2.status);
  console.log("Total:", data2.total);
  console.log("Response:", JSON.stringify(data2, null, 2));

  // ── TEST 3: GET /api/issues?projectId=... ─────────────────
  console.log("\n=== TEST 3: GET /api/issues?projectId=2d6a0ec8-... ===");
  const res3 = await fetch(
    `${API}/issues?projectId=2d6a0ec8-455c-4ad4-8b12-a55712b5fde7`
  );
  const data3 = await res3.json();
  console.log("Status:", res3.status);
  console.log("Total:", data3.total);

  // ── TEST 4: GET /api/issues?status=TODO ───────────────────
  console.log("\n=== TEST 4: GET /api/issues?status=TODO ===");
  const res4 = await fetch(`${API}/issues?status=TODO`);
  const data4 = await res4.json();
  console.log("Status:", res4.status);
  console.log("Total:", data4.total);
  if (data4.data?.length > 0) {
    console.log(
      "Sample:",
      data4.data[0].title,
      "→",
      data4.data[0].status
    );
  }

  // ── TEST 5: CORS headers check ────────────────────────────
  console.log("\n=== TEST 5: CORS Headers (OPTIONS preflight) ===");
  const res5 = await fetch(`${API}/issues`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5173",
      "Access-Control-Request-Method": "POST",
    },
  });
  console.log("Status:", res5.status);
  console.log(
    "Access-Control-Allow-Origin:",
    res5.headers.get("access-control-allow-origin")
  );
  console.log(
    "Access-Control-Allow-Methods:",
    res5.headers.get("access-control-allow-methods")
  );

  console.log("\n✅ Tất cả test hoàn tất!");
}

test().catch(console.error);
