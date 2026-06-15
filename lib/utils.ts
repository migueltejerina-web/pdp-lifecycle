import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lowercase + strip combining diacritics (NFD) for accent-insensitive matching.
 * Use in search UIs so "Debó" matches "debo" and "DEBO".
 */
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/** Pragmatic email check (non-empty local@domain.tld). Empty string is invalid — trim before calling if optional. */
export function isValidEmailFormat(email: string): boolean {
  const t = email.trim()
  if (!t) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

/**
 * Restricts input to digits only (non-numeric characters are stripped).
 * Use for integer fields like years (loan term).
 */
export function formatIntegerInput(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Restricts input to digits and at most one decimal point.
 * Use for numeric fields that may have decimals (m², price per m²).
 */
export function formatDecimalInput(value: string): string {
  const cleaned = value.replace(/,/g, ".").replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length <= 2) return cleaned
  return `${parts[0]}.${parts.slice(1).join("")}`
}

/**
 * Clamps a percentage input string to 0–100 while typing.
 * Allows digits and one decimal point; returns cleaned string or "0"/"100" when out of range.
 */
export function clampPercentageInput(value: string): string {
  const cleaned = value.replace(/,/g, ".").replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  const oneDot = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned
  if (oneDot === "" || oneDot === ".") return oneDot
  const num = parseFloat(oneDot)
  if (Number.isNaN(num)) return oneDot
  if (num > 100) return "100"
  if (num < 0) return "0"
  return oneDot
}

/**
 * Parses amounts typed in Spanish-style form: dot as thousands separator (50.000),
 * comma as decimal (1.234,56). When only dots are present, values like `50.000` are
 * **not** read as `50` (which `parseFloat` would do); they resolve to `50000`.
 * If both `.` and `,` appear, the rightmost one is treated as the decimal separator.
 */
export function parseEuropeanNumberInput(raw: string): number {
  let s = String(raw ?? "").replace(/[^\d.,-]/g, "").trim()
  if (!s) return 0
  const neg = s.startsWith("-")
  let cleaned = neg ? s.slice(1) : s
  if (!cleaned) return 0

  const lastDot = cleaned.lastIndexOf(".")
  const lastComma = cleaned.lastIndexOf(",")

  if (lastComma > -1 && lastDot > -1) {
    let t = cleaned
    if (lastComma > lastDot) {
      t = cleaned.replace(/\./g, "").replace(",", ".")
    } else {
      t = cleaned.replace(/,/g, "")
    }
    const n = parseFloat(t)
    const v = Number.isFinite(n) ? n : 0
    return neg ? -v : v
  }

  if (lastComma > -1 && lastDot === -1) {
    cleaned = cleaned.replace(/,/g, ".")
  }

  const lastDot2 = cleaned.lastIndexOf(".")
  if (lastDot2 === -1) {
    const n = parseFloat(cleaned) || 0
    return neg ? -n : n
  }

  if (/^\d{1,3}(\.\d{3})*$/.test(cleaned)) {
    const n = parseFloat(cleaned.replace(/\./g, ""))
    const v = Number.isFinite(n) ? n : 0
    return neg ? -v : v
  }

  const lastSep = lastDot2
  const afterSep = cleaned.slice(lastSep + 1)
  const isThousandsOnly = /^\d{3}$/.test(afterSep)
  if (isThousandsOnly) {
    const noSep = cleaned.replace(/[.,]/g, "")
    const n = parseFloat(noSep) || 0
    return neg ? -n : n
  }
  const beforeSep = cleaned.slice(0, lastSep).replace(/[.,]/g, "")
  const normalized = (beforeSep || "0") + "." + afterSep
  const n = parseFloat(normalized) || 0
  return neg ? -n : n
}

/**
 * Check if the app is running in demo mode (no Supabase configured)
 * Works in both server and client environments
 * Uses a consistent check that doesn't depend on window
 */
export function isDemoMode(): boolean {
  // Check environment variable - works in both SSR and client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // If no URL is set, or it's the placeholder value, we're in demo mode
  if (!supabaseUrl || supabaseUrl.trim() === '') {
    return true;
  }
  
  // Check if it's the placeholder value
  if (supabaseUrl === 'your_supabase_url_here') {
    return true;
  }
  
  // If URL exists and is valid, not in demo mode
  return false;
}

/**
 * Extract province code or name from a Spanish address
 * @param address - Full address string
 * @returns Province code or name, or null if not found
 */
export function extractProvinceFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;

  // List of Spanish provinces with their common names and codes
  const provinces = [
    // Andalucía
    { codes: ["al"], names: ["almería", "almeria"] },
    { codes: ["ca"], names: ["cádiz", "cadiz"] },
    { codes: ["co"], names: ["córdoba", "cordoba"] },
    { codes: ["gr"], names: ["granada"] },
    { codes: ["h"], names: ["huelva"] },
    { codes: ["j"], names: ["jaén", "jaen"] },
    { codes: ["ma"], names: ["málaga", "malaga"] },
    { codes: ["se"], names: ["sevilla", "seville"] },
    // Aragón
    { codes: ["hu"], names: ["huesca"] },
    { codes: ["te"], names: ["teruel"] },
    { codes: ["z"], names: ["zaragoza"] },
    // Asturias
    { codes: ["o"], names: ["asturias", "oviedo"] },
    // Baleares
    { codes: ["pm"], names: ["baleares", "mallorca", "palma"] },
    // Canarias
    { codes: ["gc"], names: ["las palmas", "gran canaria"] },
    { codes: ["tf"], names: ["santa cruz de tenerife", "tenerife"] },
    // Cantabria
    { codes: ["s"], names: ["cantabria", "santander"] },
    // Castilla y León
    { codes: ["av"], names: ["ávila", "avila"] },
    { codes: ["bu"], names: ["burgos"] },
    { codes: ["le"], names: ["león", "leon"] },
    { codes: ["p"], names: ["palencia"] },
    { codes: ["sa"], names: ["salamanca"] },
    { codes: ["sg"], names: ["segovia"] },
    { codes: ["so"], names: ["soria"] },
    { codes: ["va"], names: ["valladolid"] },
    { codes: ["za"], names: ["zamora"] },
    // Castilla-La Mancha
    { codes: ["ab"], names: ["albacete"] },
    { codes: ["cr"], names: ["ciudad real"] },
    { codes: ["cu"], names: ["cuenca"] },
    { codes: ["gu"], names: ["guadalajara"] },
    { codes: ["to"], names: ["toledo"] },
    // Cataluña
    { codes: ["b"], names: ["barcelona"] },
    { codes: ["gi"], names: ["girona", "gerona"] },
    { codes: ["l"], names: ["lleida", "lerida"] },
    { codes: ["t"], names: ["tarragona"] },
    // Comunidad Valenciana
    { codes: ["a"], names: ["alicante"] },
    { codes: ["cs"], names: ["castellón", "castellon", "castelló"] },
    { codes: ["v"], names: ["valencia"] },
    // Extremadura
    { codes: ["ba"], names: ["badajoz"] },
    { codes: ["cc"], names: ["cáceres", "caceres"] },
    // Galicia
    { codes: ["c"], names: ["a coruña", "coruña", "coruna", "la coruña"] },
    { codes: ["lu"], names: ["lugo"] },
    { codes: ["or"], names: ["ourense", "orense"] },
    { codes: ["po"], names: ["pontevedra"] },
    // Madrid
    { codes: ["m"], names: ["madrid"] },
    // Murcia
    { codes: ["mu"], names: ["murcia"] },
    // Navarra
    { codes: ["na"], names: ["navarra", "pamplona"] },
    // País Vasco
    { codes: ["vi"], names: ["álava", "alava", "vitoria"] },
    { codes: ["ss"], names: ["guipúzcoa", "guipuzcoa", "san sebastián", "san sebastian", "donostia"] },
    { codes: ["bi"], names: ["vizcaya", "bilbao"] },
    // La Rioja
    { codes: ["lo"], names: ["la rioja", "rioja", "logroño", "logrono"] },
    // Ceuta y Melilla
    { codes: ["ce"], names: ["ceuta"] },
    { codes: ["ml"], names: ["melilla"] },
  ];

  const normalizedAddress = address.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Try to find province by name first (more reliable)
  for (const province of provinces) {
    for (const name of province.names) {
      const normalizedName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalizedAddress.includes(normalizedName)) {
        return province.codes[0]; // Return first code
      }
    }
  }

  // Try to extract from postal code pattern (first 2 digits often indicate province)
  // Spanish postal codes: 28xxx for Madrid, 08xxx for Barcelona, etc.
  const postalCodeMatch = normalizedAddress.match(/\b(\d{2})\d{3}\b/);
  if (postalCodeMatch) {
    const postalCodePrefix = postalCodeMatch[1];
    // Map common postal code prefixes to province codes
    const postalCodeMap: Record<string, string> = {
      "28": "m", // Madrid
      "08": "b", // Barcelona
      "48": "bi", // Vizcaya
      "20": "ss", // Guipúzcoa
      "01": "vi", // Álava
      "46": "v", // Valencia
      "03": "a", // Alicante
      "12": "cs", // Castellón
      "15": "c", // A Coruña
      "36": "po", // Pontevedra
      "27": "lu", // Lugo
      "32": "or", // Ourense
      "41": "se", // Sevilla
      "29": "ma", // Málaga
      "18": "gr", // Granada
      "14": "co", // Córdoba
      "23": "j", // Jaén
      "04": "al", // Almería
      "11": "ca", // Cádiz
      "21": "h", // Huelva
      "50": "z", // Zaragoza
      "33": "o", // Asturias
      "35": "gc", // Las Palmas
      "38": "tf", // Santa Cruz de Tenerife
      "39": "s", // Cantabria
      "24": "le", // León
      "34": "p", // Palencia
      "37": "sa", // Salamanca
      "40": "sg", // Segovia
      "42": "so", // Soria
      "47": "va", // Valladolid
      "49": "za", // Zamora
      "02": "ab", // Albacete
      "13": "cr", // Ciudad Real
      "16": "cu", // Cuenca
      "19": "gu", // Guadalajara
      "45": "to", // Toledo
      "06": "ba", // Badajoz
      "10": "cc", // Cáceres
      "31": "na", // Navarra
      "26": "lo", // La Rioja
      "30": "mu", // Murcia
      "07": "pm", // Baleares
    };

    if (postalCodeMap[postalCodePrefix]) {
      return postalCodeMap[postalCodePrefix];
    }
  }

  return null;
}

/** `client_ready_to_rent` → "Client Ready To Rent" when no translated label exists. */
export function humanizeSnakeCaseLabel(key: string): string {
  const trimmed = key.trim();
  if (!trimmed.includes("_")) return trimmed;
  return trimmed
    .split("_")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
