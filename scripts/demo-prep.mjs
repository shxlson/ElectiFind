import { execSync } from "child_process";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  run("npm run build");
  run("npm run test");
  run("npm run test:e2e");

  console.log("\nDemo preflight complete.");
  console.log("Next steps:");
  console.log("1) Start API: npm run dev:api");
  console.log("2) Start frontend: npm run dev");
  console.log("3) Follow docs/DEMO-CHECKLIST.md for live demo flow.");
} catch (error) {
  console.error("\nDemo preflight failed. Fix errors before demo.");
  process.exit(1);
}
