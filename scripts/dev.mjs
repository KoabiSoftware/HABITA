import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { nextBin, runNpmTask } from "./commands.mjs";
import dotenv from "dotenv";

mkdirSync(".local", { recursive: true });
const mark = (s) =>
  appendFileSync(".local/startup.log", `${new Date().toISOString()} ${s}\n`);
const args = process.argv.slice(2);
const at = args.indexOf("--port");
const port =
  at >= 0
    ? args[at + 1]
    : process.env.SITES_MANAGED_LINUX_CONTAINER === "1"
      ? "5173"
      : "3000";
if (!/^\d+$/.test(port || "") || Number(port) < 1 || Number(port) > 65535)
  throw new Error("--port must be between 1 and 65535.");
mark(`starting ${args.join(" ")} port=${port}`);

let database, api, web;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  api?.kill("SIGTERM");
  web?.kill("SIGTERM");
  try {
    await database?.stopDatabase();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());

try {
  if (process.env.HABITA_EXTERNAL_DB !== "1")
    database = await import("./local-db.mjs");
  dotenv.config({ quiet: true });
  for (const task of [
    ["run", "db:generate"],
    ["run", "db:migrate"],
    ["run", "db:seed"],
    ["run", "build", "-w", "@habita/api"],
    ["run", "build", "-w", "@habita/editorial"],
    ["run", "build", "-w", "@habita/web"],
  ]) {
    runNpmTask(task, {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: task.includes("build") ? "production" : "development",
      },
    });
  }
  api = spawn(process.execPath, ["apps/api/dist/main.js"], {
    stdio: "inherit",
    env: { ...process.env, PORT: "4000", NODE_ENV: "development" },
  });
  mark(`next on ${port}`);
  web = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "0.0.0.0", "--port", port],
    {
      cwd: "apps/web",
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    },
  );
  for (const [name, child] of [
    ["api", api],
    ["web", web],
  ]) {
    child.on("error", (error) => {
      console.error(error);
      void stop(1);
    });
    child.on("exit", (code) => {
      mark(`${name} exit ${code}`);
      if (!stopping) void stop(code || 1);
    });
  }
} catch (error) {
  console.error(error);
  await stop(1);
}
