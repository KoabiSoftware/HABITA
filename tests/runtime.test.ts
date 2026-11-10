import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { nextBin, runNpmTask } from "../scripts/commands.mjs";

test("Next entry point is a native absolute path, not a URL pathname", () => {
  assert.ok(isAbsolute(nextBin));
  assert.equal(nextBin, fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)));
  if (process.platform === "win32") assert.match(nextBin, /^[A-Z]:\\/i);
});

test("npm tasks support spaces and preserve literal arguments without a shell", () => {
  const dir = mkdtempSync(join(tmpdir(), "habita npm cli "));
  try {
    const cli = join(dir, "fake npm.cjs");
    writeFileSync(cli, "console.log(JSON.stringify(process.argv.slice(2)))");
    const args = ["run", "build", "-w", "@habita/web", "a & b"];
    const result = runNpmTask(args, { npmExecPath: cli, encoding: "utf8" });
    assert.deepEqual(JSON.parse(result.stdout), args);
    writeFileSync(cli, "process.exit(7)");
    assert.throws(() => runNpmTask(["run", "build"], { npmExecPath: cli }), /failed \(7\)/);
    assert.throws(() => runNpmTask([], { npmExecPath: cli, cwd: join(dir, "missing") }), /ENOENT/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("npm tasks refuse to continue when no npm entry point is available", () => {
  assert.throws(() => runNpmTask([], { npmExecPath: "" }), /npm run dev/);
});

test("launcher exits on setup failure instead of trying to start unbuilt servers", () => {
  const dir = mkdtempSync(join(tmpdir(), "habita failed setup "));
  try {
    const cli = join(dir, "failing npm.cjs");
    writeFileSync(cli, "process.exit(7)");
    const result = spawnSync(process.execPath, ["scripts/dev.mjs"], {
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      env: { ...process.env, HABITA_EXTERNAL_DB: "1", npm_execpath: cli },
      encoding: "utf8",
      timeout: 10000,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /db:generate failed \(7\)/);
    assert.doesNotMatch(result.stderr, /Cannot find module|EADDRINUSE/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
