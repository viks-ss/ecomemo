// Dizionario delle tipologie di rifiuto riconosciute nei calendari comunali.
// Ogni tipologia canonica ha una lista di alias (parole o frasi come
// appaiono tipicamente nei PDF) usati per il riconoscimento durante
// l'estrazione automatica (vedi lib/server/pdf-parser.ts).

export type WasteKeywordEntry = {
  canonicalName: string;
  color: string;
  aliases: string[];
};

export const WASTE_KEYWORDS: WasteKeywordEntry[] = [
  {
    canonicalName: "Organico",
    color: "#22c55e",
    aliases: ["ORGANICO", "UMIDO", "FRAZIONE ORGANICA"],
  },
  {
    canonicalName: "Carta",
    color: "#3b82f6",
    aliases: ["CARTA E CARTONE", "CARTA", "CARTONE"],
  },
  {
    canonicalName: "Plastica",
    color: "#eab308",
    aliases: ["PLASTICA"],
  },
  {
    canonicalName: "Lattine",
    color: "#f97316",
    aliases: ["LATTINE", "ALLUMINIO"],
  },
  {
    canonicalName: "Vetro",
    color: "#14b8a6",
    aliases: ["VETRO"],
  },
  {
    canonicalName: "Secco residuo",
    color: "#6b7280",
    aliases: ["SECCO RESIDUO", "SECCO", "INDISTINTO", "RESIDUO", "RSU", "NON RICICLABILE"],
  },
  {
    canonicalName: "Verde",
    color: "#15803d",
    aliases: ["VERDE", "SFALCI", "POTATURE"],
  },
  {
    canonicalName: "Ingombranti",
    color: "#8b5cf6",
    aliases: ["INGOMBRANTI"],
  },
  {
    canonicalName: "Indumenti",
    color: "#ec4899",
    aliases: ["INDUMENTI", "ABITI"],
  },
];

/** Normalizza un token: maiuscolo, senza accenti, punteggiatura o asterischi. */
export function normalizeToken(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[*•·]/g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cerca le tipologie di rifiuto citate in un blocco di testo (es. una
 * cella del calendario), anche quando più tipologie sono elencate insieme
 * separate da "-", "/", "," o a capo.
 */
export function findWasteTypesInText(text: string): string[] {
  const normalized = normalizeToken(text);
  if (!normalized) return [];

  const words = normalized.split(" ");
  const found = new Set<string>();

  for (const entry of WASTE_KEYWORDS) {
    for (const alias of entry.aliases) {
      const aliasWords = normalizeToken(alias).split(" ");
      if (containsSubsequence(words, aliasWords)) {
        found.add(entry.canonicalName);
        break;
      }
    }
  }

  return Array.from(found);
}

function containsSubsequence(words: string[], subsequence: string[]): boolean {
  if (subsequence.length === 0 || subsequence.length > words.length) return false;
  for (let i = 0; i <= words.length - subsequence.length; i++) {
    let match = true;
    for (let j = 0; j < subsequence.length; j++) {
      if (words[i + j] !== subsequence[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

export function getDefaultColorForName(name: string): string {
  const entry = WASTE_KEYWORDS.find((k) => k.canonicalName === name);
  return entry?.color ?? "#6b7280";
}
