export const EMPTY_FIELD = "—";

export function formatPercent(value?: number): string {
  if (value == null) return EMPTY_FIELD;
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatEuroPerMonth(amount?: number): string {
  if (amount == null) return EMPTY_FIELD;
  return `${formatEuro(amount)}/mes`;
}

export function formatEuro(amount?: number): string {
  if (amount == null) return EMPTY_FIELD;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact amount for lifecycle copy, e.g. "48.000€". */
export function formatEuroCompact(amount?: number): string | undefined {
  if (amount == null) return undefined;
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(amount)}€`;
}

export function formatDateLong(dateStr: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}
