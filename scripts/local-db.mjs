import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { parse } from "dotenv";
mkdirSync(".local", { recursive: true, mode: 0o700 });
let config = existsSync(".env") ? parse(readFileSync(".env")) : {};
if (!config.DATABASE_URL) {
  const password = randomBytes(24).toString("hex");
  const url = `postgresql://habita:${password}@127.0.0.1:5433/habita?schema=public`;
  config = {
    DATABASE_URL: url,
    DIRECT_URL: url,
    JWT_SECRET: randomBytes(48).toString("hex"),
    API_URL: "http://127.0.0.1:4000",
    PORT: "4000",
    NODE_ENV: "development",
  };
  writeFileSync(
    ".env",
    Object.entries(config)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") + "\n",
    { mode: 0o600 },
  );
}
const url = new URL(config.DIRECT_URL || config.DATABASE_URL);
if (!["127.0.0.1", "localhost"].includes(url.hostname))
  throw Error("Este comando solo inicia PostgreSQL en loopback.");
const databaseDir = resolve(".local/postgres");
const db = new EmbeddedPostgres({
  databaseDir,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: Number(url.port),
  persistent: true,
  autoRehydrateSymlinks: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
  postgresFlags: ["-h", "127.0.0.1", "-k", ""],
  onLog: (m) => console.log(String(m)),
  onError: (e) => console.error(String(e)),
});
if (!existsSync(databaseDir + "/PG_VERSION")) await db.initialise();
await db.start();
const client = db.getPgClient("postgres");
await client.connect();
const name = url.pathname.slice(1);
if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name))
  throw Error("Nombre de base de datos no válido.");
if (
  !(await client.query("SELECT 1 FROM pg_database WHERE datname=$1", [name]))
    .rowCount
)
  await client.query(`CREATE DATABASE "${name}"`);
await client.end();
console.log(
  "PostgreSQL local disponible en 127.0.0.1:" +
    url.port +
    ". Usa Ctrl+C para detenerlo.",
);
const keepAlive = setInterval(() => {}, 10000);
let stopping;
export function stopDatabase() {
  return (stopping ??= (async () => {
    clearInterval(keepAlive);
    await db.stop();
  })());
}
process.on("SIGINT", () => stopDatabase().catch(console.error));
process.on("SIGTERM", () => stopDatabase().catch(console.error));
