/**
 * ITP (Impuesto de Transmisiones Patrimoniales) por provincia e ITP/AJD por CCAA.
 * Datos por defecto en código; en cliente se hidratan desde Supabase vía
 * GET /api/reference/spanish-tax-rates (fallback estático si no hay sesión o falla la DB).
 */

import { extractProvinceFromAddress } from "@/lib/utils";

export interface ITPRate {
  province: string;
  /** Porcentaje en decimal (p. ej. 0.10 = 10%) */
  rate: number;
  autonomousCommunity: string;
}

export interface ITPAJDRates {
  itpPercent: number;
  ajdPercent: number;
}

export type AutonomousCommunityOption = {
  value: string;
  label: string;
  rate: number;
  ajdPercent: number;
};

/** Semilla estática (alineada con reference_spanish_tax tras migración 087). */
const STATIC_ITP_BY_PROVINCE: Record<string, ITPRate> = {
  al: { province: "Almería", rate: 0.07, autonomousCommunity: "Andalucía" },
  ca: { province: "Cádiz", rate: 0.07, autonomousCommunity: "Andalucía" },
  co: { province: "Córdoba", rate: 0.07, autonomousCommunity: "Andalucía" },
  gr: { province: "Granada", rate: 0.07, autonomousCommunity: "Andalucía" },
  h: { province: "Huelva", rate: 0.07, autonomousCommunity: "Andalucía" },
  j: { province: "Jaén", rate: 0.07, autonomousCommunity: "Andalucía" },
  ma: { province: "Málaga", rate: 0.07, autonomousCommunity: "Andalucía" },
  se: { province: "Sevilla", rate: 0.07, autonomousCommunity: "Andalucía" },
  hu: { province: "Huesca", rate: 0.08, autonomousCommunity: "Aragón" },
  te: { province: "Teruel", rate: 0.08, autonomousCommunity: "Aragón" },
  z: { province: "Zaragoza", rate: 0.08, autonomousCommunity: "Aragón" },
  o: { province: "Asturias", rate: 0.1, autonomousCommunity: "Asturias" },
  pm: { province: "Baleares", rate: 0.11, autonomousCommunity: "Baleares" },
  gc: { province: "Las Palmas", rate: 0.065, autonomousCommunity: "Canarias" },
  tf: { province: "Santa Cruz de Tenerife", rate: 0.065, autonomousCommunity: "Canarias" },
  s: { province: "Cantabria", rate: 0.1, autonomousCommunity: "Cantabria" },
  av: { province: "Ávila", rate: 0.08, autonomousCommunity: "Castilla y León" },
  bu: { province: "Burgos", rate: 0.08, autonomousCommunity: "Castilla y León" },
  le: { province: "León", rate: 0.08, autonomousCommunity: "Castilla y León" },
  p: { province: "Palencia", rate: 0.08, autonomousCommunity: "Castilla y León" },
  sa: { province: "Salamanca", rate: 0.08, autonomousCommunity: "Castilla y León" },
  sg: { province: "Segovia", rate: 0.08, autonomousCommunity: "Castilla y León" },
  so: { province: "Soria", rate: 0.08, autonomousCommunity: "Castilla y León" },
  va: { province: "Valladolid", rate: 0.08, autonomousCommunity: "Castilla y León" },
  za: { province: "Zamora", rate: 0.08, autonomousCommunity: "Castilla y León" },
  ab: { province: "Albacete", rate: 0.09, autonomousCommunity: "Castilla-La Mancha" },
  cr: { province: "Ciudad Real", rate: 0.09, autonomousCommunity: "Castilla-La Mancha" },
  cu: { province: "Cuenca", rate: 0.09, autonomousCommunity: "Castilla-La Mancha" },
  gu: { province: "Guadalajara", rate: 0.09, autonomousCommunity: "Castilla-La Mancha" },
  to: { province: "Toledo", rate: 0.09, autonomousCommunity: "Castilla-La Mancha" },
  b: { province: "Barcelona", rate: 0.11, autonomousCommunity: "Cataluña" },
  gi: { province: "Girona", rate: 0.11, autonomousCommunity: "Cataluña" },
  l: { province: "Lleida", rate: 0.11, autonomousCommunity: "Cataluña" },
  t: { province: "Tarragona", rate: 0.11, autonomousCommunity: "Cataluña" },
  a: { province: "Alicante", rate: 0.1, autonomousCommunity: "Comunidad Valenciana" },
  cs: { province: "Castellón", rate: 0.1, autonomousCommunity: "Comunidad Valenciana" },
  v: { province: "Valencia", rate: 0.1, autonomousCommunity: "Comunidad Valenciana" },
  ba: { province: "Badajoz", rate: 0.07, autonomousCommunity: "Extremadura" },
  cc: { province: "Cáceres", rate: 0.07, autonomousCommunity: "Extremadura" },
  c: { province: "A Coruña", rate: 0.09, autonomousCommunity: "Galicia" },
  lu: { province: "Lugo", rate: 0.09, autonomousCommunity: "Galicia" },
  or: { province: "Ourense", rate: 0.09, autonomousCommunity: "Galicia" },
  po: { province: "Pontevedra", rate: 0.09, autonomousCommunity: "Galicia" },
  m: { province: "Madrid", rate: 0.06, autonomousCommunity: "Madrid" },
  mu: { province: "Murcia", rate: 0.08, autonomousCommunity: "Murcia" },
  na: { province: "Navarra", rate: 0.06, autonomousCommunity: "Navarra" },
  vi: { province: "Álava", rate: 0.04, autonomousCommunity: "País Vasco" },
  ss: { province: "Guipúzcoa", rate: 0.04, autonomousCommunity: "País Vasco" },
  bi: { province: "Vizcaya", rate: 0.04, autonomousCommunity: "País Vasco" },
  lo: { province: "La Rioja", rate: 0.07, autonomousCommunity: "La Rioja" },
  ce: { province: "Ceuta", rate: 0.06, autonomousCommunity: "Ceuta" },
  ml: { province: "Melilla", rate: 0.06, autonomousCommunity: "Melilla" },
};

const STATIC_ITP_AJD: Record<string, ITPAJDRates> = {
  Andalucía: { itpPercent: 7.0, ajdPercent: 1.2 },
  Aragón: { itpPercent: 8.0, ajdPercent: 1.5 },
  Asturias: { itpPercent: 10.0, ajdPercent: 1.2 },
  Baleares: { itpPercent: 11.0, ajdPercent: 1.2 },
  Canarias: { itpPercent: 6.5, ajdPercent: 0.75 },
  Cantabria: { itpPercent: 10.0, ajdPercent: 1.5 },
  "Castilla-La Mancha": { itpPercent: 9.0, ajdPercent: 1.5 },
  "Castilla y León": { itpPercent: 8.0, ajdPercent: 1.5 },
  Cataluña: { itpPercent: 11.0, ajdPercent: 1.5 },
  Ceuta: { itpPercent: 6.0, ajdPercent: 0.0 },
  Madrid: { itpPercent: 6.0, ajdPercent: 0.75 },
  "Comunidad Valenciana": { itpPercent: 10.0, ajdPercent: 1.5 },
  Extremadura: { itpPercent: 7.0, ajdPercent: 1.5 },
  Galicia: { itpPercent: 9.0, ajdPercent: 1.5 },
  "La Rioja": { itpPercent: 7.0, ajdPercent: 1.0 },
  Melilla: { itpPercent: 6.0, ajdPercent: 0.0 },
  Murcia: { itpPercent: 8.0, ajdPercent: 1.5 },
  Navarra: { itpPercent: 6.0, ajdPercent: 1.0 },
  "País Vasco": { itpPercent: 4.0, ajdPercent: 0.5 },
};

const STATIC_AUTONOMOUS_COMMUNITIES: AutonomousCommunityOption[] = [
  { value: "Andalucía", label: "Andalucía (7% ITP, 1,2% AJD)", rate: 0.07, ajdPercent: 1.2 },
  { value: "Aragón", label: "Aragón (8% ITP, 1,5% AJD)", rate: 0.08, ajdPercent: 1.5 },
  { value: "Asturias", label: "Asturias (10% ITP, 1,2% AJD)", rate: 0.1, ajdPercent: 1.2 },
  { value: "Baleares", label: "Baleares (11% ITP, 1,2% AJD)", rate: 0.11, ajdPercent: 1.2 },
  { value: "Canarias", label: "Canarias (6,5% ITP, 0,75% AJD)", rate: 0.065, ajdPercent: 0.75 },
  { value: "Cantabria", label: "Cantabria (10% ITP, 1,5% AJD)", rate: 0.1, ajdPercent: 1.5 },
  { value: "Castilla-La Mancha", label: "Castilla-La Mancha (9% ITP, 1,5% AJD)", rate: 0.09, ajdPercent: 1.5 },
  { value: "Castilla y León", label: "Castilla y León (8% ITP, 1,5% AJD)", rate: 0.08, ajdPercent: 1.5 },
  { value: "Cataluña", label: "Cataluña (11% ITP, 1,5% AJD)", rate: 0.11, ajdPercent: 1.5 },
  { value: "Ceuta", label: "Ceuta (6% ITP, 0% AJD)", rate: 0.06, ajdPercent: 0 },
  { value: "Madrid", label: "Comunidad de Madrid (6% ITP, 0,75% AJD)", rate: 0.06, ajdPercent: 0.75 },
  { value: "Comunidad Valenciana", label: "Comunidad Valenciana (10% ITP, 1,5% AJD)", rate: 0.1, ajdPercent: 1.5 },
  { value: "Extremadura", label: "Extremadura (7% ITP, 1,5% AJD)", rate: 0.07, ajdPercent: 1.5 },
  { value: "Galicia", label: "Galicia (9% ITP, 1,5% AJD)", rate: 0.09, ajdPercent: 1.5 },
  { value: "La Rioja", label: "La Rioja (7% ITP, 1% AJD)", rate: 0.07, ajdPercent: 1.0 },
  { value: "Melilla", label: "Melilla (6% ITP, 0% AJD)", rate: 0.06, ajdPercent: 0 },
  { value: "Murcia", label: "Murcia (8% ITP, 1,5% AJD)", rate: 0.08, ajdPercent: 1.5 },
  { value: "Navarra", label: "Navarra (6% ITP, 1% AJD)", rate: 0.06, ajdPercent: 1.0 },
  { value: "País Vasco", label: "País Vasco (4% ITP, 0,5% AJD)", rate: 0.04, ajdPercent: 0.5 },
];

function cloneProvinceMap(): Record<string, ITPRate> {
  const o: Record<string, ITPRate> = {};
  for (const [k, v] of Object.entries(STATIC_ITP_BY_PROVINCE)) {
    o[k] = { ...v };
  }
  return o;
}

function cloneAjdMap(): Record<string, ITPAJDRates> {
  const o: Record<string, ITPAJDRates> = {};
  for (const [k, v] of Object.entries(STATIC_ITP_AJD)) {
    o[k] = { ...v };
  }
  return o;
}

function cloneAutonomousList(): AutonomousCommunityOption[] {
  return STATIC_AUTONOMOUS_COMMUNITIES.map((x) => ({ ...x }));
}

let provinceByCode: Record<string, ITPRate> = cloneProvinceMap();
let itpAjdByCommunity: Record<string, ITPAJDRates> = cloneAjdMap();
let autonomousCommunitiesOrdered: AutonomousCommunityOption[] = cloneAutonomousList();

export type SpanishTaxRatesApiResponse = {
  success: true;
  source: "static" | "database";
  provinces: Array<{
    province_code: string;
    province_name: string;
    autonomous_community: string;
    itp_percent: number;
  }>;
  ccaa: Array<{
    autonomous_community: string;
    itp_percent: number;
    ajd_percent: number;
    ui_label: string;
    sort_order: number;
  }>;
};

export function buildSpanishTaxRatesStaticResponse(): SpanishTaxRatesApiResponse {
  const provinces = Object.entries(STATIC_ITP_BY_PROVINCE).map(([province_code, v]) => ({
    province_code,
    province_name: v.province,
    autonomous_community: v.autonomousCommunity,
    itp_percent: Math.round(v.rate * 10000) / 100,
  }));
  const ccaa = STATIC_AUTONOMOUS_COMMUNITIES.map((ac, i) => ({
    autonomous_community: ac.value,
    itp_percent: Math.round(ac.rate * 10000) / 100,
    ajd_percent: ac.ajdPercent,
    ui_label: ac.label,
    sort_order: i + 1,
  }));
  return { success: true, source: "static", provinces, ccaa };
}

function resetToStatic(): void {
  provinceByCode = cloneProvinceMap();
  itpAjdByCommunity = cloneAjdMap();
  autonomousCommunitiesOrdered = cloneAutonomousList();
}

export function applySpanishTaxRatesPayload(data: SpanishTaxRatesApiResponse): void {
  if (!data.success || !data.provinces?.length || !data.ccaa?.length) {
    resetToStatic();
    return;
  }

  const nextProvinces: Record<string, ITPRate> = {};
  for (const row of data.provinces) {
    const code = row.province_code.toLowerCase().trim();
    nextProvinces[code] = {
      province: row.province_name,
      rate: Number(row.itp_percent) / 100,
      autonomousCommunity: row.autonomous_community,
    };
  }
  provinceByCode = nextProvinces;

  const nextAjd: Record<string, ITPAJDRates> = {};
  for (const row of data.ccaa) {
    nextAjd[row.autonomous_community] = {
      itpPercent: Number(row.itp_percent),
      ajdPercent: Number(row.ajd_percent),
    };
  }
  itpAjdByCommunity = nextAjd;

  const sorted = [...data.ccaa].sort((a, b) => a.sort_order - b.sort_order);
  autonomousCommunitiesOrdered = sorted.map((row) => ({
    value: row.autonomous_community,
    label: row.ui_label,
    rate: Number(row.itp_percent) / 100,
    ajdPercent: Number(row.ajd_percent),
  }));
}

let loadPromise: Promise<void> | null = null;
let loadedFromRemote = false;

/**
 * Hidrata tasas desde la API (Supabase con sesión o respuesta estática).
 * Sin efecto en SSR; en cliente es idempotente tras la primera carga exitosa.
 */
export async function ensureSpanishTaxRatesLoaded(): Promise<void> {
  if (typeof window === "undefined") return;
  if (loadedFromRemote) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const res = await fetch("/api/reference/spanish-tax-rates", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as SpanishTaxRatesApiResponse;
        if (data.success && data.provinces?.length && data.ccaa?.length) {
          applySpanishTaxRatesPayload(data);
          loadedFromRemote = true;
        }
      } catch (error) {
        console.error("[ensureSpanishTaxRatesLoaded]:", error);
      }
    })().finally(() => {
      loadPromise = null;
    });
  }
  await loadPromise;
}

/** Lista actual para selectores (copia defensiva). */
export function getAutonomousCommunities(): AutonomousCommunityOption[] {
  return autonomousCommunitiesOrdered.map((x) => ({ ...x }));
}

export const DEFAULT_ITP_RATE = 0.08;

export function getITPRate(provinceCodeOrName: string | null | undefined): number {
  if (!provinceCodeOrName) {
    return DEFAULT_ITP_RATE;
  }

  const normalized = provinceCodeOrName.toLowerCase().trim();

  if (provinceByCode[normalized]) {
    return provinceByCode[normalized].rate;
  }

  let matchingEntry = Object.values(provinceByCode).find(
    (entry) =>
      entry.province.toLowerCase().includes(normalized) ||
      normalized.includes(entry.province.toLowerCase())
  );

  if (!matchingEntry) {
    matchingEntry = Object.values(provinceByCode).find(
      (entry) =>
        entry.autonomousCommunity.toLowerCase().includes(normalized) ||
        normalized.includes(entry.autonomousCommunity.toLowerCase())
    );
  }

  if (matchingEntry) {
    return matchingEntry.rate;
  }

  return DEFAULT_ITP_RATE;
}

export function getITPRateInfo(provinceCodeOrName: string | null | undefined): ITPRate | null {
  if (!provinceCodeOrName) {
    return null;
  }

  const normalized = provinceCodeOrName.toLowerCase().trim();

  if (provinceByCode[normalized]) {
    return { ...provinceByCode[normalized] };
  }

  let matchingEntry = Object.values(provinceByCode).find(
    (entry) =>
      entry.province.toLowerCase().includes(normalized) ||
      normalized.includes(entry.province.toLowerCase())
  );

  if (!matchingEntry) {
    matchingEntry = Object.values(provinceByCode).find(
      (entry) =>
        entry.autonomousCommunity.toLowerCase().includes(normalized) ||
        normalized.includes(entry.autonomousCommunity.toLowerCase())
    );
  }

  return matchingEntry ? { ...matchingEntry } : null;
}

export function getITPAndAJDByCommunity(communityName: string | null | undefined): ITPAJDRates | null {
  if (!communityName?.trim()) return null;
  const normalized = communityName.trim();
  if (itpAjdByCommunity[normalized]) {
    return { ...itpAjdByCommunity[normalized] };
  }
  const lower = normalized.toLowerCase();
  if (lower === "comunidad de madrid" || lower === "madrid") {
    const m = itpAjdByCommunity.Madrid;
    return m ? { ...m } : null;
  }
  const entry = Object.entries(itpAjdByCommunity).find(
    ([key]) =>
      key.toLowerCase() === lower ||
      key.toLowerCase().includes(lower) ||
      lower.includes(key.toLowerCase())
  );
  return entry ? { ...entry[1] } : null;
}

export function inferAutonomousCommunityFromText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const provinceCode = extractProvinceFromAddress(text);
  if (!provinceCode) return null;
  const info = getITPRateInfo(provinceCode);
  return info?.autonomousCommunity ?? null;
}
