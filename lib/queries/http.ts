export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Piccolo wrapper fetch: estrae `message` dal corpo JSON e lo usa come
 * messaggio d'errore quando la risposta non è ok. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: isFormData
      ? init?.headers
      : { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message ?? "Qualcosa non ha funzionato. Riprova tra qualche secondo.", res.status);
  }
  return data as T;
}
