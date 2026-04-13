/**
 * Script test nhanh Create Issue + Update Status API.
 * Chạy: node src/test-api.js
 */

const API = "http://localhost:5000/api";

async function test() {
  console.log("=== TEST 1: Create Issue (EPIC) ===");
  const res1 = await fetch(`${API}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Setup Infrastructure",
      description: "Cài đặt môi trường dev",
      type: "EPIC",
      projectId: "2d6a0ec8-455c-4ad4-8b12-a55712b5fde7",
      assigneeId: "6bf8f903-6944-4c26-815d-975077c8406e",
      reporterId: "bd86c76b-6644-4b5c-94ed-fbe6b8bcba2f",
    }),
  });
  const data1 = await res1.json();
  console.log("Status:", res1.status);
  console.log("Response:", JSON.stringify(data1, null, 2));

  const issueId = data1.data?.id;

  console.log("\n=== TEST 2: Create Issue (TASK) ===");
  const res2 = await fetch(`${API}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Viết API Create Issue",
      type: "TASK",
      projectId: "2d6a0ec8-455c-4ad4-8b12-a55712b5fde7",
      parentId: issueId,
    }),
  });
  const data2 = await res2.json();
  console.log("Status:", res2.status);
  console.log("Response:", JSON.stringify(data2, null, 2));

  console.log("\n=== TEST 3: Update Status (TODO -> IN_PROGRESS) ===");
  const res3 = await fetch(`${API}/issues/${issueId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "IN_PROGRESS" }),
  });
  const data3 = await res3.json();
  console.log("Status:", res3.status);
  console.log("Response:", JSON.stringify(data3, null, 2));

  console.log("\n=== TEST 4: Validation Error (missing title) ===");
  const res4 = await fetch(`${API}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: "2d6a0ec8-455c-4ad4-8b12-a55712b5fde7" }),
  });
  const data4 = await res4.json();
  console.log("Status:", res4.status);
  console.log("Response:", JSON.stringify(data4, null, 2));

  console.log("\n=== TEST 5: Invalid status ===");
  const res5 = await fetch(`${API}/issues/${issueId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "INVALID" }),
  });
  const data5 = await res5.json();
  console.log("Status:", res5.status);
  console.log("Response:", JSON.stringify(data5, null, 2));

  console.log("\n✅ Tất cả test hoàn tất!");
}

test().catch(console.error);
