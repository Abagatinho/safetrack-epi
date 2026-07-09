import { promises as fs } from "fs";
import path from "path";
import type { DB } from "./types";
import seed from "../data/db.json";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

/**
 * O filesystem de uma função serverless é somente leitura. Sem tratamento,
 * qualquer POST em produção estoura em 500 e a demo pública vira uma vitrine
 * que não deixa cadastrar nada.
 *
 * Então: escreve no arquivo quando dá (desenvolvimento local, onde persiste
 * entre reinícios) e cai para memória quando o disco recusa. Em memória, os
 * dados vivem enquanto a instância viver — o suficiente para uma demo ao vivo,
 * e a instância seguinte simplesmente recomeça do seed.
 */
let memory: DB | null = null;
let diskIsReadOnly = false;

function cloneSeed(): DB {
  return structuredClone(seed) as DB;
}

export async function readDB(): Promise<DB> {
  // Depois que o disco recusou uma escrita, a verdade está na memória.
  if (diskIsReadOnly && memory) return memory;

  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as DB;
  } catch {
    // O arquivo pode não ter sido incluído no bundle. O seed importado sim.
    memory ??= cloneSeed();
    return memory;
  }
}

export async function writeDB(db: DB): Promise<void> {
  if (diskIsReadOnly) {
    memory = db;
    return;
  }

  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "EROFS" && code !== "EACCES" && code !== "EPERM") throw error;

    diskIsReadOnly = true;
    memory = db;
  }
}
