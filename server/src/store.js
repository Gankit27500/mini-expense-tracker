import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../data/db.json");

export async function readDb() {
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  const tmpPath = `${dbPath}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(tmpPath, dbPath);
}
