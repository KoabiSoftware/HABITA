import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);

export function runNpmTask(
  args,
  { npmExecPath = process.env.npm_execpath, ...options } = {},
) {
  if (!npmExecPath) throw new Error("Start the project with npm run dev.");
  // Run npm's JavaScript entry point without a shell (including paths with spaces).
  const result = spawnSync(process.execPath, [npmExecPath, ...args], options);
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `npm ${args.join(" ")} failed (${result.status ?? result.signal}).`,
    );
  return result;
}
