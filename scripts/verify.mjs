import EmbeddedPostgres from "embedded-postgres";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
mkdirSync(".local", { recursive: true, mode: 0o700 });
const dir = mkdtempSync(resolve(".local/verify-"));
const secret = randomBytes(32).toString("hex");
const db = new EmbeddedPostgres({
  databaseDir: dir,
  user: "habita",
  password: secret,
  port: 5544,
  persistent: true,
  authMethod: "scram-sha-256",
  autoRehydrateSymlinks: true,
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
  postgresFlags: ["-h", "127.0.0.1", "-k", ""],
  onLog: () => {},
  onError: console.error,
});
let server;
let web;
let status = 1;
try {
  await db.initialise();
  await db.start();
  await db.createDatabase("habita_test");
  const url = `postgresql://habita:${secret}@127.0.0.1:5544/habita_test?schema=public`;
  Object.assign(process.env, {
    DATABASE_URL: url,
    DIRECT_URL: url,
    JWT_SECRET: randomBytes(48).toString("hex"),
    PORT: "4400",
    TEST_API_URL: "http://127.0.0.1:4400/api",
    ADMIN_EMAIL: "admin@habita.test",
    ADMIN_PASSWORD: randomBytes(20).toString("hex"),
  });
  for (const args of [
    ["run", "db:migrate"],
    ["run", "db:seed"],
    ["run", "build", "-w", "@habita/api"],
  ]) {
    const r = spawnSync("npm", args, { stdio: "inherit", env: process.env });
    if (r.status) throw Error("Falló " + args.join(" "));
  }
  server = spawn("node", ["apps/api/dist/main.js"], {
    stdio: ["ignore", "ignore", "inherit"],
    env: process.env,
  });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(process.env.TEST_API_URL + "/health")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  const webBuild = spawnSync(
    "npm",
    ["run", "build", "-w", "@habita/editorial"],
    { stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } },
  );
  if (webBuild.status) throw Error("Astro build");
  const nextBuild = spawnSync("npm", ["run", "build", "-w", "@habita/web"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      API_URL: "http://127.0.0.1:4400",
    },
  });
  if (nextBuild.status) throw Error("Next build");
  process.env.TEST_WEB_URL = "http://127.0.0.1:4401";
  web = spawn(
    process.execPath,
    [
      resolve("node_modules/next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "4401",
    ],
    {
      cwd: "apps/web",
      stdio: ["ignore", "ignore", "inherit"],
      env: {
        ...process.env,
        NODE_ENV: "production",
        API_URL: "http://127.0.0.1:4400",
      },
    },
  );
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(process.env.TEST_WEB_URL + "/robots.txt")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  const result = await new Promise((resolve) => {
    const child = spawn("npm", ["test"], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", resolve);
  });
  status = Number(result || 0);
} finally {
  web?.kill("SIGTERM");
  server?.kill("SIGTERM");
  await db.stop();
  rmSync(dir, { recursive: true, force: true });
}
process.exitCode = status;
