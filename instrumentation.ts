// Avvia il controllo periodico dei promemoria all'avvio del server.
// Nessuna coda o scheduler esterno: un semplice timer in-process, in
// linea con la semplicità richiesta per un'app self-hosted (vedi
// lib/server/reminder-check.ts).

declare global {
  var __ecomemoReminderInterval: NodeJS.Timeout | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (globalThis.__ecomemoReminderInterval) return;

  const { runReminderCheck } = await import("@/lib/server/reminder-check");

  globalThis.__ecomemoReminderInterval = setInterval(() => {
    runReminderCheck().catch((err) => {
      console.error("[reminder-check] errore durante il controllo periodico:", err);
    });
  }, 60_000);
}
