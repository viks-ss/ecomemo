import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "pdfs");

function safePath(userId: string, fileId: string): string {
  // userId/fileId sono entrambi cuid generati da noi, mai input diretto
  // dell'utente: nessun rischio di path traversal.
  return path.join(STORAGE_ROOT, userId, `${fileId}.pdf`);
}

export async function savePdfFile(
  userId: string,
  fileId: string,
  buffer: Buffer,
): Promise<string> {
  const filePath = safePath(userId, fileId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return filePath;
}

export async function readPdfFile(storedPath: string): Promise<Buffer> {
  return readFile(storedPath);
}

export async function deletePdfFile(storedPath: string): Promise<void> {
  await unlink(storedPath).catch(() => undefined);
}
