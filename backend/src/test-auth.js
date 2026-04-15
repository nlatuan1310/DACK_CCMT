// Quick test for Auth API endpoints
const BASE = "http://localhost:5000/api/auth";

async function test() {
  console.log("=== 1) TEST REGISTER ===");
  const regRes = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    }),
  });
  const regData = await regRes.json();
  console.log("Status:", regRes.status);
  console.log("Body:", JSON.stringify(regData, null, 2));

  const token = regData.data?.token;

  console.log("\n=== 2) TEST LOGIN ===");
  const loginRes = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "123456",
    }),
  });
  const loginData = await loginRes.json();
  console.log("Status:", loginRes.status);
  console.log("Body:", JSON.stringify(loginData, null, 2));

  console.log("\n=== 3) TEST GET /me ===");
  const meRes = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token || loginData.data?.token}` },
  });
  const meData = await meRes.json();
  console.log("Status:", meRes.status);
  console.log("Body:", JSON.stringify(meData, null, 2));

  console.log("\n=== 4) TEST /me WITHOUT TOKEN ===");
  const noAuthRes = await fetch(`${BASE}/me`);
  const noAuthData = await noAuthRes.json();
  console.log("Status:", noAuthRes.status);
  console.log("Body:", JSON.stringify(noAuthData, null, 2));

  console.log("\n=== 5) TEST DUPLICATE REGISTER ===");
  const dupRes = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    }),
  });
  const dupData = await dupRes.json();
  console.log("Status:", dupRes.status);
  console.log("Body:", JSON.stringify(dupData, null, 2));
}

test().catch(console.error);
