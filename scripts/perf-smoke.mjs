const API_BASE = process.env.PERF_API_BASE || "http://localhost:4000";
const ITERATIONS = Number(process.env.PERF_ITERATIONS || 30);
const WARN_MS = Number(process.env.PERF_WARN_MS || 350);

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function registerAndLogin() {
  const email = `perf-${Date.now()}@electifind.local`;
  const password = "PerfPass123";

  await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Perf User",
      email,
      password
    })
  }).catch(() => {});

  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }

  const loginData = await loginRes.json();
  return loginData.token;
}

async function timedGet(path, token) {
  const start = performance.now();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const end = performance.now();

  if (!res.ok) {
    throw new Error(`Request ${path} failed with status ${res.status}`);
  }

  return end - start;
}

async function main() {
  const token = await registerAndLogin();

  const paths = [
    "/api/dashboard",
    "/api/recommendations",
    "/api/courses/search?q=data"
  ];

  const allTimes = [];

  for (let i = 0; i < ITERATIONS; i += 1) {
    for (const path of paths) {
      const t = await timedGet(path, token);
      allTimes.push(t);
    }
  }

  const avg = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
  const p95 = percentile(allTimes, 95);
  const p99 = percentile(allTimes, 99);

  console.log(`Perf smoke (${allTimes.length} requests):`);
  console.log(`avg=${avg.toFixed(1)}ms p95=${p95.toFixed(1)}ms p99=${p99.toFixed(1)}ms`);

  if (p95 > WARN_MS) {
    console.warn(`WARNING: p95 ${p95.toFixed(1)}ms exceeds threshold ${WARN_MS}ms`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
