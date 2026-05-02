import path from "node:path";
import { appendFile, mkdir, readFile } from "node:fs/promises";

const logDir = path.resolve(process.cwd(), "logs");
const logFile = path.join(logDir, "app.log");

async function ensureLogDirectory() {
  await mkdir(logDir, { recursive: true });
}

export async function logEvent(message: string) {
  await ensureLogDirectory();
  const timestamp = new Date().toISOString();
  const line = `${timestamp} ${message}\n`;
  await appendFile(logFile, line, "utf8");
  console.log(line.trim());
}

export async function getLogData() {
  try {
    await ensureLogDirectory();
    return await readFile(logFile, "utf8");
  } catch {
    return "";
  }
}
