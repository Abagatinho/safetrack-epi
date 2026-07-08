import { promises as fs } from "fs";
import path from "path";
import type { DB } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function readDB(): Promise<DB> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
}

export async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}
