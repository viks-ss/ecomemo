import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Ritorna l'id dell'utente autenticato, o null se non c'è sessione. */
export async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
